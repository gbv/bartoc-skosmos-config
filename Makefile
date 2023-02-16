config: Skosmos/config.ttl

Skosmos/config.ttl: config/main.ttl config/categories.ttl vocabularies.ttl
	# TODO: check valid Turtle/RDF syntax
	cat config/main.ttl config/categories.ttl vocabularies.ttl > $@

init:
	git submodule update --init
	cd Skosmos && [ -f composer.phar ] || curl -sS https://getcomposer.org/installer | php
	cd Skosmos && rm -f composer.lock && php composer.phar install --no-dev
