const N3 = require('n3')
const fs = require('fs')

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

module.exports = { N3, readRDF, readRDFFile, removeQuads }
