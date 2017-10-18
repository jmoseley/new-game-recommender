#!/bin/bash

export AWS_CONFIG_FILE="./.aws_config"

timestamp=$(date +%s)

aws s3 cp ./bundle.js s3://game-recommending-bot/bundle-$timestamp.js
