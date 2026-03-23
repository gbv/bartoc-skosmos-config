# BARTOC Skosmos

Dieses git-Repository enthält Konfigurationsdateien und Skripte zur Verwaltung von BARTOC Skosmos (<https://skosmos.bartoc.org/>). Die Benutzeroberfläche ist als git submodule im Repository <https://github.com/gbv/bartoc-skosmos> mit einem Fork von Skosmos, während hier Skripte zur Verwaltung des Terminologiedienst liegen.

## Installation

Ein Teil der Installation ist durch Aufruf von `make install` automatisiert. Vorausgesetzt wird:

- `npm`
- `pip` (Python3)

Anschließend muss ein Apache-Webserver entsprechend der [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial) mit dem `Skosmos` Verzeichnis als `DocumentRoot` eingerichtet werden. Der Webserver kann auch auf einem anderen Port als `:80` laufen, wenn dieser schon belegt ist.

Ein Test-Aufruf von Skosmos unter http://localhost:80/ sollte anschließend folgende Fehlermeldung liefert:

> Error: config.ttl file is missing, please provide one.

Die Grundkonfiguration wird mit `./config init` erstellt. Anschließend sollte BARTOC folgende Meldung anzeigen:

> No vocabularies on the server!

Nun muss ein auf Port 3030 erreichbarer Fuseki-Triple-Store mit einer Datenbank `skosmos` eingerichtet werden (siehe [Installationsanleitung](https://github.com/NatLibFi/Skosmos/wiki/InstallTutorial)).

## Verwaltung von Vokabularen

Zum Hinzufügen, Aktualisieren und Entfernen von Vokabularen dient das Skript `./config`, dem jeweils ein Befehl und eine BARTOC-ID übergeben wird:

~~~
./config info 1232       # Konfiguration von Vokabular 15 anzeigen (auch falls nicht aktiviert)
./config download 1232   # Vokabulardaten herunterladen (falls Ort bekannt)
./config prepare 1232    # Heruntergeladene Vokabulardaten zum Laden vorbereiten (NOCH NICHT UMGESETZT)
./config add 1232        # Vokabular 15 aktivieren bzw. Konfiguration aktualisieren.
./config load 1232       # Daten von Vokabular 1232 in Fuseki laden (falls vorhanden)
./config unload 1232	 # Daten von Vokabular 1232 in Fuseki entfernen (falls vorhanden)
~~~

Das Vorbereiten (Bereinigen und Konvertieren) von heruntergeladenen Vokabularen muss noch per Hand gemacht werden, z.B.

~~~
./skosify stage/11/csh.rdf
~~~

Oder

~~~
rapper -i turtle stage/1234.ttl > load/1234.nt
~~~

## Update von Skosmos

Permanenter Wechsel des Branch von Skosmos:

~~~
git submodule set-branch -b $branch Skosmos
git submodule sync
git submodule update --init --recursive --remote
~~~

## Migration von Basel

### Redirects von alten URLs

Die Skosmos-Instanz unter <https://bartoc-skosmos.unibas.ch/> verwendete Kurznamen statt BARTOC-ID-Nummern. Um Redirects von alten URLs (bei neuem Server) zu erhalten wurden zunächst bekannte BARTOC-IDs auf Kurznamen gemappt:

~~~
grep bartoc-skosmos latest.ndjson | jq -rc '[(.uri|split("/")[-1]),(.API[].url|select(match("bartoc-skosmos"))|split("/")[-2])]|@csv' | sed s/\"//g > shortnames.csv
~~~

Einige Einträge waren nicht 1-zu-1 und wurden per Hand angepasst. Es bleiben folgenden zu klärende Fälle:

~~~csv
460,ocm,outlinecm
707,fast-event,fast-formgenre,fast-title,fast-chrono,fast-geo
~~~

Die 1-zu-n Einträge können mit `make redirects` in Einträge für die Apache2-Konfiguration umgewandelt werden.

