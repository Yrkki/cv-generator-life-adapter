#!/bin/bash

echo Running launch script
echo ------------------------------------------------------
echo

echo Launching server environment...

. ./env.sh
node ./bin/www &

echo Server launched.


echo
# read  -n 1 -p "x" input
# exit