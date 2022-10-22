# Generell

Diese Skripte wurden aus eigenem Antrieb erstellt, um mir das Surfen auf https://www.moviepilot.de/ zu erleichtern. Es handelt sich lediglich um ein paar kleine Helferlein, die ich entweder selbst entwickelt oder von anderen Usern übernommen haben.

Legendär ist das Klickstreckenskript, das ein Inhaltsverzeichnis von mehrseitigen Artikeln erzeugt hat. Mittlerweile ist dies obsolet, weil Moviepilot keine Klickstrecken mehr verwendet.

Um diese Skripte zu nutzen, benötigt man eine Browsererweiterung, die Skripte ausführen kann. Ich benutze dafür "Tampermonkey".

Chrome:
https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=de

Firefox:
https://addons.mozilla.org/de/firefox/addon/tampermonkey/

Einige der Skripte sind bereits veraltet und funktionieren möglicherweise nicht mehr, da sich Moviepilot in der Zwischenzeit verändert hat.

## mp-avoid-clickgal
(ursprünglicher Autor: [mitcharts](https://github.com/mitcharts), überarbeitet von: [leinzi](https://github.com/Leinzi))

Erstellung eines Inhaltsverzeichnisses für Klickstrecken.

Dieses Skript erstellt für Artikel mit Bilderstrecken ein Inhaltsverzeichnis mit Titel und Link zu den jeweiligen Unterseiten. Dieses kann in die Kommentare kopiert werden, um den Mitpiloten eine Freude zu machen.

## mp-cleanup
(ursprünglicher Autor: [mitcharts](https://github.com/mitcharts), überarbeitet von: [leinzi](https://github.com/Leinzi))

Anpassungen am HTML-Code für sämtliche Moviepilot-Unterseiten. (wird im Moment überarbeitet)

Das Skript dient auch als eine Art Framework für den Nutzer, da dieser selber entscheiden kann, welche Bereiche angezeigt werden sollen und welche nicht.

## mp-series-cleanup
(ursprünglicher Autor: [mitcharts](https://github.com/mitcharts), überarbeitet von: [leinzi](https://github.com/Leinzi))

Anpassungen am HTML-Code für die Moviepilot-Serienseite.

Mit diesem Skript lassen sich einzelne Rubriken der neuen Serienseite ein- und ausblenden. Hierfür müssen die zugehörigen Checkboxen verwendet werden. Ausgewählte Bereiche werden angezeigt, nicht-ausgewählte werden versteckt. Durch einen Klick auf Speichern wird die aktuelle Konfiguration angewendet. Dies ist auch ohne Neuladen der Seite möglich. Für die Staffelübersichtsseite ist eine eigene Konfiguration möglich.

Die Konfiguration bleibt so lange gespeichert, bis der Browser-Cache geleert wird.

In der aktuellen Version werden auch kleine Änderungen am Stil vorgenommen. So wurde der Kommentar- und Statistikbereich auf die volle Breite gestreckt. Es wurden ebenfalls die Graufilter der Avatare und Cast-/Crewmitglieder entfernt (funktioniert im Kommentarbereich leider nicht korrekt).

Das Skript funktioniert nun auch für die Serien- und Staffelunterseiten.

# Weitere Skripte

## MoviePilot-Rating-Extension
(Autor: [kevgaar / rockschlumpf](https://github.com/kevgaar))

Ein Skript zur Darstellung von zusätzlichen Ratings (z.B. imdb oder RottenTomatoes).
[Mein Fork](https://github.com/Leinzi/MoviePilot-Rating-Extension)

## MoviePilot-ReleaseDate-Extension
(Autor: [kevgaar / rockschlumpf](https://github.com/kevgaar))

Ein Skript zur Erweiterung des Kinostarts um einen "noch x Tage"-Zähler.
[Mein Fork](https://github.com/Leinzi/MoviePilot-ReleaseDate-Extension)
