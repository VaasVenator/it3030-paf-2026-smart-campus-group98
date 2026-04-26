#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./make-admin.sh <username-or-id>"
  exit 1
fi
mvn spring-boot:run -Dspring-boot.run.arguments="--promote-admin=$1 --spring.main.web-application-type=none"
