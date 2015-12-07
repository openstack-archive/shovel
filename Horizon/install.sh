#!/bin/bash

TEMP=`getopt -o u:l: --long url: --long location: -- "$@"`

if [ $? != 0 ] ; then echo "Exit" ; exit 1 ; fi

eval set -- "$TEMP"
echo $TEMP
ADDR_IP=${ADDR_IP-}
FILE_LOC=${FILE_LOC-}

while true ; do
        case "$1" in
		-u | --url) ADDR_IP=$2 ;shift 2 ;;
		-l | --location) FILE_LOC=$2;shift 2 ;; 
		--) shift; break ;;
		*) echo "Internal error!" ; exit 1 ;;
        esac 
done 
echo "get shovel url: " $ADDR_IP 
echo "get file location: " $FILE_LOC 
if [ -z "$ADDR_IP" -o -z "$FILE_LOC" ] 
then
   echo "You must specify ipaddr of shovel and horizon location"
   exit 1
fi

#replace in shovel.py  SHOVEL_URL with the new addre value
sed -i "s|.*URI = .*|URI = \"$ADDR_IP\" + SHOVEL_BASE_API|g" rackhd/shovel.py
#copy rackhd to horizon admin dashboard
cp -r rackhd $FILE_LOC/openstack_dashboard/dashboards/admin
#copy _50_admin_rackhd_panels.py to dashboard enabled
cp _50_admin_rackhd_panels.py $FILE_LOC/openstack_dashboard/enabled
