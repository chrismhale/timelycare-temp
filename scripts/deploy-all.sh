#!/bin/bash

# This script deploys the entire ProperView application using SST.
# It assumes you have AWS credentials configured in your environment.

set -e

echo "===== 🚀 Deploying ProperView Infrastructure via SST ====="

# Navigate to the infrastructure directory, regardless of where the script is run from
cd "$(dirname "$0")/../infra"

# Install dependencies
echo "--- Installing infrastructure dependencies ---"
npm install

# Deploy the stack using the npm script, which runs "sst deploy"
echo "--- Deploying the stack via SST ---"
npm run deploy

echo "✅ Deployment successful!"
echo "You can view your deployed site URL in the SST command output."