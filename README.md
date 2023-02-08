# BARTOC Skosmos

Dieses Repository enthält Konfigurationsdateien für BARTOC Skosmos and der VZG.

BARTOC Skosmos wurde bis 2023 an der UB Basel gehostet.

## Installation

Vorausgesetzt wird Docker mit docker-compose.

Die Konfiguration befindet sich wie [hier beschrieben](https://github.com/NatLibFi/Skosmos/wiki/Install-Skosmos-with-Fuseki-in-Docker) in
der Datei `docker-compose.yml` und weiteren dort referenzierten Konfigurationsdateien im Verzeichnis `config/`.

Testen, dass Fuseki erreichbar ist:

	curl localhost:9031/\$/ping

## Config

    config [prod|dev]

## Update

    sudo ./build

### Import

See `./import.sh`. To automatically import files from `import/` directory listed in `vocabularies.ttl`: 

    ./import.sh --all

Script requires `comunica-sparql-file` but this may be changed:

    npm install -g @comunica/query-sparql-file

## Usage

Dev-instance is be made available <http://localhost:9090/>. Production instance at <https://skosmos.bartoc.org/>.

