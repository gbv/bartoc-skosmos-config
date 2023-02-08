#!/usr/bin/bash
set -e

fuseki=http://localhost:9031

if [ $# != 2 ]; then
  echo "Usage: $0 graph-uri file.ttl"
  exit 0
fi

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

curl -I -X POST -H Content-Type:$type -T $file -G $fuseki/skosmos/data --data-urlencode graph=$graph
