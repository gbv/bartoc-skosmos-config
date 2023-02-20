#!/usr/bin/env zx

The script expects a command as first argument

```js
const { N3, readRDF, readRDFFile, removeQuads } = require("./src/rdf.js")

const cmd = argv._[0] || ""
const self = process.argv[2]
const usage = `Usage: ${self} info|load|add|remove|download bartoc-uri`
if (argv.help || argv.h || !cmd) {
  echo(usage)  
  process.exit()
}

if (!cmd.match(/^info|load|add|remove|download$/)) {
  error(`Unknown command: ${cmd}`)
}
```

The vocabulary identifier is passed as command line argument as URI or plain number.

```js
const id = ("" + argv._[1]).replace(/^https?:\/\/bartoc\.org\/[a-z+]\/node\//,"")
if (!id.match(/^[1-9][0-9]*$/) || argv._.length > 2) {
  error(usage)
}
const uri = `http://bartoc.org/en/node/${id}`
```

BARTOC.org is then queried for the vocabulary as JSKOS Concept Scheme. The vocabulary must be found to proceed.

```js
const jskos = (await fetch(`https://bartoc.org/api/data?uri=${uri}`).then(res => res.json()))[0]
if (jskos?.type?.[0] != "http://www.w3.org/2004/02/skos/core#ConceptScheme") {
  error(`Not a concept scheme: ${uri}`)
} 
```

A custom JSON-LD context document contains the mapping of selected JSKOS fields to Skosmos configuration format.

```js
const context = {
  // JSKOS Concept Scheme fields not included (yet): 
  // address, altLabel, changeNote, contributor, created, creator
  // definition, depiction, editorialNote, endDate, endPlace, example
  // hiddenLabel, historyNote, issued, location, modified, notation, note, partOf, prefLabel, publisher, scopeNote, source, startDate, startPlace, subjectOf,
  // topConcepts
  // versionOf
  // notationPattern
  // notationExamples
  // concepts, types
  // distributions
  // extent


  uri: "@id",
  prefLabel: {
    "@id": "http://purl.org/dc/terms/title",
    "@container": "@language"
  },
  subject: {
    "@id": "http://purl.org/dc/terms/subject",
    "@container": "@language"
  },
  type: {
    "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "@type": "@id",
    "@container": "@set"
  },

  identifier: { "@id": "http://purl.org/dc/terms/identifier", "@container": "@set" },
  languages: { "@id": "http://purl.org/net/skosmos#language", "@container": "@set" },
  license: { "@id": "http://purl.org/dc/terms/license", "@container": "@set" },
  namespace: "http://rdfs.org/ns/void#uriSpace",
  notation: { "@id": "http://purl.org/net/skosmos#shortName", "@container": "@set" },
  uriPattern: "http://rdfs.org/ns/void#voidRegexPattern",
  url: { "@id": "http://xmlns.com/foaf/0.1/homepage", "@type": "@id" },

  graph: { "@id": "http://purl.org/net/skosmos#sparqlGraph", "@type": "@id" },

// TODO        skosmos:defaultLanguage "en" ;
// TODO        skosmos:showTopConcepts true ;

// => dct:relation
// => dc:description
// => dc:publisher

// not included (yet?)
// skosmos:defaultLanguage
// skosmos:fullAlphabeticalIndex
// skosmos:searchByNotation
// skosmos:showAlphabeticalIndex
// skosmos:showNotation (included in BARTOC!)
// skosmos:showPropertyInSearch
// skosmos:showTopConcepts
// skosmos:sortByNotation
// void:dataDump
// skosmos:conceptSchemesInHierarchy
// skosmos:defaultSidebarView
// skosmos:externalProperty
}
```

The JSKOS record is adjusted to relevant information used in Skosmos...

```js

// TODO: skosmos vocabulary may subsume multiple concept schemes!

jskos.type = [ "http://purl.org/net/skosmos#Vocabulary", "http://rdfs.org/ns/void#DataSet" ]
jskos["@context"] = context
// TODO: keep other subjects as well!
if (jskos.subject) {
  jskos.subject = jskos.subject
    .filter(({uri}) => uri.match(/^http:\/\/dewey\.info\/class\/[0-9]\/e23\/$/))
    .map(({uri, prefLabel}) => ({uri, prefLabel}))
}

jskos.graph = `https://skosmos.bartoc.org/${id}`
```

...and then transformed to RDF.

```js
const { namedNode } = N3.DataFactory

async function jsonldGraph(doc) {
  const jsonld = require('jsonld')
  const format = "application/n-quads"
  const nquads = await jsonld.toRDF(doc, { format })
  return readRDF(nquads, format)
}

const store = await jsonldGraph(jskos)
```

Additional configuration of the vocabulary is included.

```js
const config = await readRDFFile("config/vocabularies.ttl", "application/turtle")
store.addQuads(config.getQuads(namedNode(uri), null, null))
```

With command `info` the vocabulary configuration is printed in RDF/Turtle format.

```js
const vocs = await readRDFFile("vocabularies.ttl", "application/turtle")
const count = vocs.countQuads(namedNode(uri))

if (cmd == "info") {
  echo(await writeTurtle(store))
  if (!count) {
    echo `# Vocabulary missing from vocabularies.ttl! Run: ${self} add ${id}`
  }
} else {
  echo `found ${uri}`
}
```

```js
const dump = store.getObjects(namedNode(uri),namedNode("http://rdfs.org/ns/void#dataDump"))[0]?.id
const namespace = store.getObjects(namedNode(uri),namedNode("http://rdfs.org/ns/void#uriSpace"))[0]?.id
```

```js
if (cmd == "download") {
  if (dump) {
    await downloadRDF(id, dump)
  } else {
    error("Missing void:dataDump")
  }
  process.exit(0)
}

async function downloadRDF(id, url) {
  const filename = (await $`curl -OJsL ${url} --fail -w "%{filename_effective}"`) || "download"
  const fullname = `stage/${id}/${filename}`
  echo("")

  echo`Downloading ${url} to ${fullname}`
  await fs.ensureDir(`stage/${id}`)
  await $`curl --show-error --fail -L ${url} > ${fullname}`

  var format
  if (fullname.match(/\.(nt|ttl)$/)) {
    format = "application/turtle"
  } else if (fullname.match(/\.(rdf|rdfxml|xml)$/)) {
    format = "application/rdf+xml"
  } else {
    // See https://github.com/dice-group/rdfdetector for better approach
    const firstline = await $`head -1 ${fullname}`
    if (firstline.match(/^\*<?xml/i)) {
      format = "application/rdf+xml"
    } else {
      format = "application/turtle"
    }
  }

  echo `Guess format is ${format}`
}

```

An URI namespace must be know to proceed.

```js
if (!namespace) {
  error("Missing mandatory URI namespace!")
}
```

With command `load` the vocabulary content is loaded into Fuseki, command `add` adds it to Skosmos configuration.

```js
const fuseki = "http://localhost:3030"
const graph = `https://skosmos.bartoc.org/${id}`

if (cmd == "load") {
  const ntfile = `load/${id}.nt`
  if (!fs.existsSync(ntfile)) {
    error(`Missing ${ntfile} to load`)
  }
  echo(`Loading ${ntfile} into ${graph}`)
  await $`/opt/fuseki/bin/s-put ${fuseki}/skosmos/data ${graph} ${ntfile}`

  if (!count) {
    echo `Vocabulary missing from vocabularies.ttl! Run: ${self} add ${id}`
  }
} else if (cmd == "add") {
  if (count) {
    removeQuads(vocs, namedNode(uri))
  }
  vocs.addQuads(store.getQuads())
  echo((count ? `Update ${id} in` : `Add ${id} to`) + ' vocabularies.ttl')
  fs.writeFileSync("vocabularies.ttl", await writeTurtle(vocs))
  await $`make config`
} else if (cmd == "remove") {
  if (count) {
    echo(`Remove ${id} from vocabularies.ttl`)
    removeQuads(voc, namedNode(uri))
    fs.writeFileSync("vocabularies.ttl", await writeTurtle(vocs))
    await $`make config`
  } else {
    echo `Vocabulary ${id} has not been added.`
  }
}
```

Some utility functions below.

```js
function error(msg) {
  console.warn(chalk.red(msg))
  process.exit(1)
}

async function writeTurtle(store) {
  const prefixes = {
    void: "http://rdfs.org/ns/void#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    skosmos: "http://purl.org/net/skosmos#",
    dc: "http://purl.org/dc/terms/",
    dct: "http://purl.org/dc/terms/",
    foaf: "http://xmlns.com/foaf/0.1/"
  }
  const baseIRI = "http://bartoc.org/en/node/"
  const writer = new N3.Writer({format: "Turtle", prefixes, baseIRI})
  writer.addQuads(store.getQuads())
  return new Promise(resolve => {
    writer.end((error, result) => resolve(`@base <${baseIRI}>.` + "\n" + result))
  })
}
```
