#!/usr/bin/env bash

APP="/radioterio-rtmp-encoder"
XVFB_ARGS="-nolisten tcp -screen 0 1920x1080x30+32"

trap 'pkill -INT -f "^$APP"; wait $PID' INT
trap 'pkill -TERM -f "^$APP"; wait $PID' TERM
trap 'pkill -USR1 -f "^$APP"; wait $PID' USR1

xvfb-run -a --server-args="$XVFB_ARGS" $APP & PID=$!

wait $PID
