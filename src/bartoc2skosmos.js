import { readJSONLD } from "./rdf.js"

// A custom JSON-LD context document contains the mapping of selected JSKOS fields to Skosmos configuration format.

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

  showNotation: "http://purl.org/net/skosmos#showNotation",
  sortByNotation: "http://purl.org/net/skosmos#sortByNotation",
  searchByNotation: "http://purl.org/net/skosmos#searchByNotation",
  showTopConcepts: "http://purl.org/net/skosmos#showTopConcepts",

// TODO        skosmos:defaultLanguage "en" ;
// TODO        skosmos:showTopConcepts "true" ;

// => dct:relation
// => dc:description
// => dc:publisher

// not included (yet?)
// skosmos:defaultLanguage
// skosmos:fullAlphabeticalIndex
// skosmos:showAlphabeticalIndex
// skosmos:showPropertyInSearch
// void:dataDump
// TODO: skosmos vocabulary may subsume multiple concept schemes!
// skosmos:conceptSchemesInHierarchy
// skosmos:defaultSidebarView
// skosmos:externalProperty
}

// The JSKOS record is adjusted to relevant information used in Skosmos...

export async function bartoc2skosmos(jskos) {
  const id = jskos.uri.split("/").pop()

  // TODO: set depending on type
  jskos.showTopConcepts = "true"

  jskos.type = [ "http://purl.org/net/skosmos#Vocabulary", "http://rdfs.org/ns/void#DataSet" ]
	
  // TODO: keep other subjects as well!
  if (jskos.subject) {
    jskos.subject = jskos.subject
      .filter(({uri}) => uri.match(/^http:\/\/dewey\.info\/class\/[0-9]\/e23\/$/))
      .map(({uri, prefLabel}) => ({uri, prefLabel}))
  }

  if (!jskos.DISPLAY?.hideNotation) {
    jskos.showNotation = "true"
    jskos.sortByNotation = "true"
    jskos.searchByNotation = "true"
  }

  jskos.graph = `https://skosmos.bartoc.org/${id}`

  jskos["@context"] = context

  return readJSONLD(jskos)
}
