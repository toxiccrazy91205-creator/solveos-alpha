#!/bin/bash

# Script to setup swap space on Ubuntu EC2 instances
# This helps prevent "SIGKILL" errors during memory-intensive builds like Next.js

SWAP_SIZE="4G"
SWAP_PATH="/swapfile"

echo "Checking for existing swap..."
if grep -q "$SWAP_PATH" /proc/swaps; then
    echo "Swap already exists at $SWAP_PATH. Skipping."
    exit 0
fi

echo "Creating ${SWAP_SIZE} swap file at ${SWAP_PATH}..."
sudo fallocate -l $SWAP_SIZE $SWAP_PATH || sudo dd if=/dev/zero of=$SWAP_PATH bs=1M count=4096
sudo chmod 600 $SWAP_PATH
sudo mkswap $SWAP_PATH
sudo swapon $SWAP_PATH

echo "Making swap permanent..."
if ! grep -q "$SWAP_PATH" /etc/fstab; then
    echo "$SWAP_PATH none swap sw 0 0" | sudo tee -a /etc/fstab
fi

echo "Current memory status:"
free -h

echo "Swap setup complete!"
