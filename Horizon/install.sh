#!/bin/bash

TEMP=`getopt -o u:l: --long url: --long location: -- "$@"`

if [ $? != 0 ] ; then echo "Exit" ; exit 1 ; fi

eval set -- "$TEMP"
SHOVEL_URL=${SHOVEL_URL-}
FILE_LOC=${FILE_LOC-}

while true ; do
        case "$1" in
		-u | --url) SHOVEL_URL=$2 ;shift 2 ;;
		-l | --location) FILE_LOC=$2;shift 2 ;; 
		--) shift; break ;;
		*) echo "Internal error!" ; exit 1 ;;
        esac 
done 
echo "get shovel url: " $SHOVEL_URL 
echo "get file location: " $FILE_LOC 
if [ -z "$SHOVEL_URL" -o -z "$FILE_LOC" ] 
then
   echo "You must specify Shovel service URL(http://<ipaddr>)using --url <shovel-url>"
   echo "and horizon location using --location <horizon path>"
   exit 1
fi

#replace in shovel.py  SHOVEL_URL with the new url value
sed -i "s|.*URI = .*|URI = \"$SHOVEL_URL\" + SHOVEL_BASE_API|g" rackhd/shovel.py
#copy rackhd to horizon admin dashboard
cp -r rackhd $FILE_LOC/openstack_dashboard/dashboards/admin
#copy _50_admin_rackhd_panels.py to dashboard enabled
cp _50_admin_rackhd_panels.py $FILE_LOC/openstack_dashboard/enabled
