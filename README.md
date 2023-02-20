# BARTOC Skosmos

Dieses git-Repository enthält Konfigurationsdateien und Skripte zur Verwaltung von BARTOC Skosmos (<https://skosmos.bartoc.org/>). Die Benutzeroberfläche ist als git submodule im Repository <https://github.com/gbv/bartoc-skosmos> mit einem Fork von Skosmos, während hier Skripte zur Verwaltung des Terminologiedienst liegen.

## Installation

Ein Teil der Installation ist durch Aufruf von `make install` automatisiert. Vorausgesetzt wird `npm`.

Anschließend muss ein Apache-Webserver entsprechend der [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial) mit dem `Skosmos` Verzeichnis als `DocumentRoot` eingerichtet werden. Der Webserver kann auch auf einem anderen Port als `:80` laufen, wenn dieser schon belegt ist.

Ein Test-Aufruf von Skosmos unter http://localhost:80/ sollte anschließend folgende Fehlermeldung liefert:

> Error: config.ttl file is missing, please provide one.

Die Grundkonfiguration wird mit `./conf init` erstellt. Anschließend sollte BARTOC folgende Meldung anzeigen:

> No vocabularies on the server!

Nun muss ein auf Port 3030 erreichbarer Fuseki-Triple-Store mit einer Datenbank `skosmos` eingerichtet werden (siehe [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial)).

## Vokabulare verwalten

Zum Hinzufügen, Aktualisieren und Entfernen von Vokabularen dient das Skript `./config`, dem jeweils ein Befehl und eine BARTOC-ID übergeben wird:

~~
./config info 1232       # Konfiguration von Vokabular 15 anzeigen (auch falls nicht aktiviert)
./config add 1232        # Vokabular 15 aktivieren bzw. Konfiguration aktualisieren.
./config download 1232   # Vokabulardaten herunterladen (falls Ort bekannt)
./config convert 1232    # Heruntergeladene Vokabulardaten konvertieren (NOCH NICHT UMGESETZT)
./config load 1232       # Daten von Vokabular 15 in Fuseki laden (falls vorhanden)
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


