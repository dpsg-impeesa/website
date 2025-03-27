# Theme aktualisieren

Aktuell wird das [Theme](https://github.com/emhl/hugo-dpsg) als go module verwendet.

Die Versionen der module, die verwendet werden sollen stehen in [go.mod](/go.mod), wärend in [gp.sum](/go.sum) die checksummen der mal installierten versionen stehen.

mit [hugo mod get](https://gohugo.io/commands/hugo_mod_get/) kann man sowohl neue module installieren, als auch bereits installierte aktualisieren (neuere version installieren)

wenn alle genwünschten module aktualisiert sind, kann man mit `hugo mod tidy` die checksummen liste in [gp.sum](/go.sum) aufräumen, sodass nurnoch die installierten Versionen dort stehen.
