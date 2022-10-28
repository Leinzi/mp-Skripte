# Generell

Diese Skripte wurden aus eigenem Antrieb erstellt, um mir das Surfen auf https://www.moviepilot.de/ zu erleichtern. Es handelt sich lediglich um ein paar kleine Helferlein, die ich entweder selbst entwickelt oder von anderen Usern übernommen haben.

Legendär ist das Klickstreckenskript, das ein Inhaltsverzeichnis von mehrseitigen Artikeln erzeugt hat. Mittlerweile ist dies obsolet, weil Moviepilot keine Klickstrecken mehr verwendet.

Um diese Skripte zu nutzen, benötigt man eine Browsererweiterung, die Skripte ausführen kann. Ich benutze dafür "Tampermonkey".

Chrome:
https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=de

Firefox:
https://addons.mozilla.org/de/firefox/addon/tampermonkey/

Einige der Skripte sind bereits veraltet und funktionieren möglicherweise nicht mehr, da sich Moviepilot in der Zwischenzeit verändert hat.

# Installation eines Skriptes - eine nicht-technische Erklärung

### Schritt 1
Nach Installation der Browsererweiterung wird diese oben rechts (Chrome) angezeigt.
![01_kontextmenue](https://user-images.githubusercontent.com/7453781/198718153-3758db8b-32ad-4d13-9ecf-e240e5bd976d.png)

### Schritt 2
In der Übersicht werden die installierten Skripte angezeigt.
![02_uebersicht](https://user-images.githubusercontent.com/7453781/198718158-23288de0-55fd-40b8-998a-ff2af719b592.png)

### Schritt 3
Um ein Skript zu installieren, muss dieses aus der Dateiliste hier in GitHub ausgewählt werden und anschließend auf den Button "Raw" geklickt werden.
![03_github](https://user-images.githubusercontent.com/7453781/198718160-7a6aced9-2a6d-44f0-a478-fa23581e7af9.png)

### Schritt 4
Dann öffnet sich ein Tab, in welchem man zur Installation des Skripts aufgefordert wird.
![04_installation](https://user-images.githubusercontent.com/7453781/198718162-2d0c4e73-4fd0-40a8-a2b7-47fb719ce9e1.png)

### Schritt 5
Nach Installation des Skripts taucht dieses in der Übersicht auf.
![05_ubersicht](https://user-images.githubusercontent.com/7453781/198718164-ad6847b2-752e-4552-8943-8de7752d1a45.png)

### Schritt 6
Die Zahl unter dem Icon zeigt an, wie viele Skripte auf der aktuellen URL ausgeführt werden.
![06_moviepilot](https://user-images.githubusercontent.com/7453781/198718168-7bb24a02-682e-4df0-8cad-62a4bbd02e7f.png)

## MP-Kommentarfeed (mp-comment-feed)

Der Kommentarfeed wird unterhalb der Dashboard-Sektion eingefügt. Im Moment werden dort die 20 neuesten Kommentare angezeigt. Eine Interaktion (Liken, Melden, Antworten) mit den Kommentaren ist technisch leider nicht nachstellbar. Der Feed dient als reine Übersicht, um neue Kommentare lesen zu können.

![07_kommentarfeed](https://user-images.githubusercontent.com/7453781/198718171-1049cc1f-4bf2-4e34-af1d-dda6722c12fc.png)


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
