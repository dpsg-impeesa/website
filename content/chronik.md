---
title: "Chronik"
description: "Die Geschichte und wichtigsten Meilensteine des DPSG Stamm Impeesa Radolfzell"
page: true
slug: chronik
menu:
  main:
    name: "Chronik"
    weight: 3
aliases:
  - /timeline
  - /geschichte
sidebar: false
post_meta_hide: true
---

Hier findet ihr eine interaktive Zeitreise durch die Geschichte unseres Stammes.

{{< timelinejs-search data="chronik.yaml" >}}

{{< timelinejs 
  data="chronik.yaml" 
  language="de" 
  hash_bookmark="true" 
  scale_factor=8
  zoom_sequence="2, 4, 6, 8, 12, 14"
  timenav_height_percentage=40
  height="800px"
  duration="300"
>}}
