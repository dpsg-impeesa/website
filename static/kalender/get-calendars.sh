#!/bin/sh

NC_URL="https://dpsg-radolfzell-cloud.de/remote.php/dav/public-calendars/"

DIR=$(dirname "$0")
echo "Downloading calendars to $DIR"

get_calendar() {
	id=$1
	name=$2
	echo "Downloading calendar $name"
	curl -s -o "$DIR/$name.ics" "$NC_URL$id/?export"
}

get_calendar BmnSo2YZeZH7BK8m stamm
get_calendar sGbQKez8aCqTQHLT rover
get_calendar 4wobNH9tjkCiZmZn pfadis
get_calendar 6QGzjM8nq2oEAM67 jufis
get_calendar WzwTkAFxM6Hs3aDw wös
get_calendar xGPXppXZjESFL7NJ leiter
