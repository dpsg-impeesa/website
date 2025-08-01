#!/usr/bin/env bash
set -e
scripts/get-calendars.sh 
hugo --gc --minify
