# BARTOC Skosmos

Dieses Repository enthält Konfigurationsdateien und Skripte zur Verwaltung von BARTOC Skosmos (<https://skosmos.bartoc.org/>).

Vorausgesetzt wird ein Fuseki-Triple-Store, der per Port 3030 erreichbar ist.

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


