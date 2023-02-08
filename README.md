# BARTOC Skosmos

Dieses Repository enthält Konfigurationsdateien für BARTOC Skosmos and der VZG.

BARTOC Skosmos wurde bis 2023 an der UB Basel gehostet.

## Installation

Vorausgesetzt wird Docker mit docker-compose.

Die Konfiguration befindet sich wie [hier beschrieben](https://github.com/NatLibFi/Skosmos/wiki/Install-Skosmos-with-Fuseki-in-Docker) in
der Datei `docker-compose.yml` und weiteren dort referenzierten Konfigurationsdateien im Verzeichnis `config/`.

Testen, dass Fuseki erreichbar ist:

	curl localhost:9031/\$/ping

## Update

    sudo docker compose up -d

### Update Skosmos web application (e.g. CSS file)

    sudo docker compose build && sudo docker compose up -d

### Import

~~~sh
./import.sh http://skos.um.es/unescothes/ unescothes.ttl
./import.sh http://zbw.eu/stw/ stw.ttl
~~~
