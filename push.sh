#! /bin/bash

git add -A
getopts "m:" arg
msg=$OPTARG
git ci -am "$msg"
branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
git push origin $branch
