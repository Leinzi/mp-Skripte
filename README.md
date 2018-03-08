## mp-avoid-clickgal
(ursprünglicher Autor: mitcharts, überarbeitet von: leinzi)

Erstellung eines Inhaltsverzeichnisses für Klickstrecken.

Dieses Skript erstellt für Artikel mit Bilderstrecken ein Inhaltsverzeichnis mit Titel und Link zu den jeweiligen Unterseiten. Dieses kann in die Kommentare kopiert werden, um den Mitpiloten eine Freude zu machen.

## mp-cleanup
(ursprünglicher Autor: mitcharts, überarbeitet von: leinzi)

Anpassungen am HTML-Code für sämtliche Moviepilot-Unterseiten. (wird im Moment überarbeitet)

Das Skript dient auch als eine Art Framework für den Nutzer, da dieser selber entscheiden kann, welche Bereiche angezeigt werden sollen und welche nicht.

## mp-series-cleanup
(ursprünglicher Autor: mitcharts, überarbeitet von: leinzi)

Anpassungen am HTML-Code für die Moviepilot-Serienseite.

Mit diesem Skript lassen sich einzelne Rubriken der neuen Serienseite ausblenden. Hierfür müssen die zugehörigen Zeilen auskommentiert werden. Zum Beispiel entfernt diese Zeile den Statistikenbereich der Seite:
```
// "Statistik" entfernen
removeElementByText(sections, 'h2', 'Statistiken');
```

Um diesen wieder anzuzeigen, muss die Zeile so abgeändert werden:
```
// "Statistik" entfernen
//removeElementByText(sections, 'h2', 'Statistiken');
```
Analog können auch die anderen Bereich angezeigt oder ausgeblendet werden.

In der aktuellen Version werden auch kleine Änderungen am Stil vorgenommen. So wurde die Seitenbreite erhöht und auch der Kommentar- und Statistikbereich auf die volle Breite gestreckt. Es wurden ebenfalls die Graufilter der Avatare und Cast-/Crewmitglieder entfernt (funktioniert im Kommentarbereich leider nicht korrekt).

Das Skript funktioniert nun auch für die Serien- und Staffelunterseiten.
