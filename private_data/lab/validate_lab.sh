#!/bin/bash

lab=$1
STUDENT_NAME=$2

VALIDATION_SCRIPT="/var/www/private_data/lab/validator-2026.sh"

if [ ! -f "$VALIDATION_SCRIPT" ]; then
    echo "Validation script missing"
    exit 1
fi

source "$VALIDATION_SCRIPT"

case "$lab" in

    lab1)
        validate_lab1_navigation
        ;;

    lab2)
        validate_lab2_fs_mgt
        ;;

    *)
        echo "Invalid lab"
        exit 1
        ;;
esac
