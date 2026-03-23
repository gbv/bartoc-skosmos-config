import { $ } from "zx"
import { echo, error, ok, warn, readCSV } from "./src/utils.js"
import { cmd, id, usage } from "./src/cli.js"
import fs from "fs-extra"

const commands = {
  init,
  info: 1,
  load: 1,
  unload,
  add: 1,
  remove: 1,
  download: 1
}

usage(commands)

import { FusekiClient } from "./src/database.js"
const database = new FusekiClient("http://localhost:3030")

if (cmd == "init") {
  await init()
  process.exit()
}

if (!id) { error("Please provide a BARTOC ID/URI!") }
const uri = `http://bartoc.org/en/node/${id}`
const graph = `https://skosmos.bartoc.org/${id}`

ok(`# ${uri} found at bartoc.org`)

// BARTOC.org is queried for the vocabulary as JSKOS Concept Scheme. The vocabulary must be found to proceed.
const jskos = (await fetch(`https://bartoc.org/api/data?uri=${uri}`).then(res => res.json()))[0]
if (jskos?.type?.[0] != "http://www.w3.org/2004/02/skos/core#ConceptScheme") {
  error(`Not a concept scheme: ${uri}`)
} 

// BARTOC.org record is transformed to Skosmos RDF
import { bartoc2skosmos } from "./src/bartoc2skosmos.js"
const store = await bartoc2skosmos(jskos)

import { N3, readRDF, readRDFFile, removeQuads, writeTurtle, downloadRDF } from "./src/rdf.js"
const { namedNode, literal } = N3.DataFactory

// Additional configuration of the vocabulary
const vocsv = readCSV("vocabularies.csv").find(v => v.id == id)
if (vocsv) {
  var n = 0
  for (let key in vocsv) {
    var value = vocsv[key]
    if (key != "id" && value) {
      value = /^https?:\/\//.test(value) ? namedNode(value) : literal(value)
      store.addQuad(namedNode(uri), namedNode(key), value)
      n++
    }
  }
  ok(`# ${uri} found in vocabularies.csv with ${n} additional statement`)
}

// With command `info` the vocabulary configuration is printed in RDF/Turtle format.

// TODO: get from Fuseki database instead
const vocs = await readRDFFile("vocabularies.ttl", "application/turtle")
const count = vocs.countQuads(namedNode(uri))

if (cmd == "info") {
  echo(await writeTurtle(store, "http://bartoc.org/en/node/"))
  if (!count) {
    warn(`# Vocabulary missing from vocabularies.ttl! Run: ./config add ${id}`)
  }
}

const dump = store.getObjects(namedNode(uri),namedNode("void:dataDump"))[0]?.id
const namespace = store.getObjects(namedNode(uri),namedNode("http://rdfs.org/ns/void#uriSpace"))[0]?.id

if (cmd == "download") {
  if (dump) {
    await downloadRDF(id, dump)
  } else {
    error("Missing void:dataDump")
  }
  process.exit(0)
}

// An URI namespace must be know to proceed.

if (!namespace) {
  warn("# Missing URI namespace - Vocabulary content will not be visible!")
}

// With command `load` the vocabulary content is loaded into Fuseki, command `add` adds it to Skosmos configuration.

async function unload() {
  return database.deleteGraph(graph)
}

if (cmd == "unload") {
  console.log(await unload())
} else if (cmd == "load") {
  database.putGraph(graph, `load/${id}.nt`)
  // TODO: show result
  if (!count) {
    warn`Vocabulary missing from vocabularies.ttl! Run: ./config add ${id}`
  }
} else if (cmd == "add") {
  if (count) {
    removeQuads(vocs, namedNode(uri))
  }
  vocs.addQuads(store.getQuads())
  echo((count ? `Update ${id} in` : `Add ${id} to`) + ' vocabularies.ttl')
  fs.writeFileSync("vocabularies.ttl", await writeTurtle(vocs, "http://bartoc.org/en/node/"))
  await init()
} else if (cmd == "remove") {
  if (count) {
    echo(`Remove ${id} from vocabularies.ttl`)
    // TODO: remove from Fuseki
//    removeQuads(config, namedNode(uri))
    fs.writeFileSync("vocabularies.ttl", await writeTurtle(vocs, "http://bartoc.org/en/node/"))
    await init()
  } else {
    echo `Vocabulary ${id} has not been added.`
  }
}


async function init() {
  const vocfile = "vocabularies.ttl"
  if (!fs.existsSync(vocfile)) {
    fs.closeSync(fs.openSync(vocfile, "a"))
  }
  database.putGraph("https://skosmos.bartoc.org/vocabularies", vocfile)
  await $`cat main.ttl categories.ttl ${vocfile} > Skosmos/config.ttl`
}

