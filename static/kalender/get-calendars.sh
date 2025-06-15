#!/bin/sh

NC_URL="https://cloud.dpsg-radolfzell.de/remote.php/dav/public-calendars/"

DIR=$(dirname "$0")
echo "Downloading calendars to $DIR"

get_calendar() {
	id=$1
	name=$2
	echo "Downloading calendar $name"
	curl -s -o "$DIR/$name.ics" "$NC_URL$id/?export"
	sed -i 's/(Admin)/(DPSG Stamm Impeesa)/' $DIR/$name.ics
}

get_calendar c5yMSBoWp9qRstkd stamm
get_calendar KkddcdLgTtQWoJx7 rover
get_calendar cBe3NCsN4PfGDHNw pfadis
get_calendar M4b3JGqt6jWGnMKe jufis
get_calendar sMRJ43N6q8KL6ktw wös
get_calendar qZygR93cKXjeeSfd leiter
