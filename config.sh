#!/usr/bin/bash
set -e
cat config.$1.ttl vocabularies.$1.ttl > /dev/null
cat config.$1.ttl vocabularies.$1.ttl > skosmos-config.ttl
