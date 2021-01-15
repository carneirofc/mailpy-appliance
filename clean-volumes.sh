#!/bin/bash
set -x
set -e
for a in $(docker ps -a |grep mailpy-appliance_db |awk '{ print $1 }'); do docker rm -v $a; done
