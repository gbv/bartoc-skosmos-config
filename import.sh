#!/usr/bin/bash
set -e

fuseki=http://localhost:9031

import() {
  graph=$1
  file=$2

  type=text/turtle

  # n3: text/n3; charset=utf-8
  # nt: text/plain
  # rdf: application/rdf+xml
  # owl: application/rdf+xml
  # nq: application/n-quads
  # trig: application/trig
  # jsonld: application/ld+json

  echo "Importing $file into $graph..."
  curl -s -X POST -H "Content-Type:$type" -T "$file" "$fuseki/skosmos/data?graph=$graph"
}

if [ "$1" == "--all" ]; then
  comunica-sparql-file vocabularies.ttl 'SELECT ?u ?f { ?s <http://purl.org/net/skosmos#sparqlGraph> ?u; <http://purl.org/net/skosmos#localFile> ?f }' \
      | jq -r '.[]|[.u,.f]|@tsv' | sed 's|file://||' | while read graph file ; do
    import "$graph" "$file"
  done
elif [ $# == 2 ]; then
  import "$1" "$2"
else
  echo "Usage: $0 [graph-uri file.ttl | --all]"
  exit 0
fi
