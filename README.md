# BARTOC Skosmos

Dieses git-Repository enthält Konfigurationsdateien und Skripte zur Verwaltung von BARTOC Skosmos (<https://skosmos.bartoc.org/>). Die Benutzeroberfläche ist als git submodule im Repository <https://github.com/gbv/bartoc-skosmos> mit einem Fork von Skosmos, während hier Skripte zur Verwaltung des Terminologiedienst liegen.

## Installation

Vorausgesetzt wird ein auf Port 3030 erreichbarer Fuseki-Triple-Store mit einer Datenbank `skosmos` (siehe [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial)).

Skosmos wird im Unterverzeichnis `Skosmos` ausgecheckt:

~~~
git submodule update --init
~~

Anschließend muss ein Apache-Webserver entsprechend der [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial) mit dem Skosmos-Verzeichnis als `DocumentRoot` eingerichtet werden. Der Webserver kann auch auf einem anderen Port als `:80` laufen, wenn dieser schon belegt ist.

Ein Test-Aufruf von Skosmos unter http://localhost:80/ sollte folgende Fehlermeldung liefert:

> Error: config.ttl file is missing, please provide one.

Die fehlende Konfiguration wird mit `make config.ttl` erstellt.

## Vokabulare hinzufügen, aktualisieren, löschen...

Das Skript `voc.md` benötigt [zx](https://github.com/google/zx).

~~
./voc.md info $id
./voc.md add $id   # add or replace
./voc.md load $id
~~~

Das Entfernen von Vokabular-Daten aus Fuseki geht so:

~~~
/opt/fuseki/bin/s-delete http://esx-43.gbv.de:3030/skosmos/data $graph
~~~

## Update von Skosmos

Permanenter Wechsel des Branch von Skosmos:

~~
git submodule set-branch -b $branch Skosmos
git submodule sync
git submodule update --init --recursive --remote
~~


