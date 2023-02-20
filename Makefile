install:
	echo "Install Skosmos dependencies"
	git submodule update --init
	cd Skosmos && [ -f composer.phar ] || curl -sS https://getcomposer.org/installer | php
	cd Skosmos && rm -f composer.lock && php composer.phar install --no-dev
	echo "Install node modules"
	npm i
	echo "Install Skosify"
	pip install --user --upgrade skosify

redirects: shortnames.csv
	awk -F, '{print "RedirectMatch ^/"$$2"(/.*)?$$ /"$$1"$$1"}' shortnames.csv

