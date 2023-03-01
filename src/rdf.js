import N3 from 'n3'
import fs from 'fs-extra'
import jsonld from "jsonld"
import { $ } from 'zx'
import { echo } from './utils.js'

function removeQuads(store, subject, predicate, object) {
  for (let quad of store.getQuads(subject, predicate, object))
    store.removeQuad(quad)
}

async function readRDF(data, format) {
  const store = new N3.Store()
  const parser = new N3.Parser({ format })
    await parser.parse(data, (error, quad, prefixes) => {
    if (error) throw new Error(`PARSE ERROR: ${error}`)
    if (quad) store.addQuad(N3.DataFactory.quad(quad._subject, quad._predicate, quad._object))
  })
  return store
}

async function readRDFFile(file, format) {
  return readRDF(fs.readFileSync(file).toString(), format)
}

async function readJSONLD(doc) {
  const format = "application/n-quads"
  const nquads = await jsonld.toRDF(doc, { format })
  return readRDF(nquads, format)
}

async function writeTurtle(store, baseIRI) {
  const prefixes = {
    void: "http://rdfs.org/ns/void#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    skosmos: "http://purl.org/net/skosmos#",
    dc: "http://purl.org/dc/terms/",
    dct: "http://purl.org/dc/terms/",
    foaf: "http://xmlns.com/foaf/0.1/"
  }
  const writer = new N3.Writer({format: "Turtle", prefixes, baseIRI})
  writer.addQuads(store.getQuads())
  return new Promise(resolve => {
    writer.end((error, result) => resolve(`@base <${baseIRI}>.` + "\n" + result))
  })
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

export { N3, readRDF, readRDFFile, removeQuads, readJSONLD, writeTurtle, downloadRDF }
