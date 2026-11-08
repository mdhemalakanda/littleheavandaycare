#!/bin/bash
# Serve the built site locally — http://localhost:8130
cd "$(dirname "$0")/../site" && python3 -m http.server 8130
