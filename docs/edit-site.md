# Bearbeiten der Webseite

## Ordnerstruktur

- Alle Textinhalte (pages & posts) liegen im ordner `content`.
  - speziell sind dabei die `_index.md` Dateien. Diese beschreiben keine normalen seiten, sondern Listen von den unterseiten.
- Vorlagen wie aus den textinhalten html generiert werden soll, liegen im Ordner `layouts`
- Statische Dateien wie Bilder, CSS, JS, etc. liegen im Ordner `static`
  - Bilder für posts sollten jeweils in einem Unterordner mit dem Jahr der Veröffentlichung in `static/images/upload` liegen
  - Anweisungen an den Webserver, wie Anfragen an gewisse urls weitergeleitet werden sollen, sind in `static/_redirects`
- Einstellungen für Hugo sind in der Datei `config.toml`

um neue Beiträge zu erstellen werden demnach hauptsächlich neue Dateien in `content` und `static/images/upload` angelegt.

## Markdown mit front matter

Die Datien in `content` haben alle `.md` als Datiendung, was für Markdown steht. Einen Schnellen überblick über die verschiedenen Elemente gibt es in [basic-elements.md](/docs/basic-elements.md)

Die Datien haben alle aber auch ein "Front Matter" mit den Informationen, die in der Datei stehen.
diese enthalten zusätzliche metadaten für die jeweilige Seite, wie z.B. ob diese in der Navigation auftauchen soll, welchen Veröffentlichungszeitpunkt sie haben, etc.

Beispiel:

```yaml
---
title: "Ein Beispiel"
description: "Ein Beispiel"
date: 2022-01-01
categories:
  - "Nachrichten"
tags:
  - "Stamm"
  - "Beispiel"
menu:
  main:
    name: "Beispiel"
    weight: 1
---

```
mehr mögliche optionen, die hier gesetzt werden können, finden sich in der [Theme Dokumentation](https://github.com/emhl/hugo-dpsg/blob/master/README.md#front-matter-example)

## Vorschau der Seite anzeigen

Um die Seite zu sehen, wie sie aussehen wird, kann man sie mit `hugo server` in einem Terminal öffnen. und dann unter `localhost:1313` im Browseraufrufen.
Wenn man wärenddessen die Dateien ändert, wird die Seite automatisch neu geladen und die Änderungen werden angezeigt.
