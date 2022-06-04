#!/bin/bash

echo "Generating snapshot (.blu) files"
./node_modules/.bin/bf orchestrator:create --hierarchical --in ./orchestrator-files/lu/Dispatch --out ./orchestrator-files/blu/Dispatch.blu --model ./orchestrator-files/model
./node_modules/.bin/bf orchestrator:create --hierarchical --in ./orchestrator-files/lu/SmallTalk --out ./orchestrator-files/blu/SmallTalk.blu --model ./orchestrator-files/model
echo "Finished generating snapshot (.blu) files"
