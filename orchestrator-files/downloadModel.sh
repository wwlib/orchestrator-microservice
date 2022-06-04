#!/bin/bash

echo "Downloading model"
#./node_modules/.bin/bf orchestrator:basemodel:get --getEntity --versionId=pretrained.20210205.microsoft.dte.00.06.unicoder_multilingual.onnx --out=./orchestrator-files/model/
./node_modules/.bin/bf orchestrator:basemodel:get --versionId=pretrained.20210205.microsoft.dte.00.06.unicoder_multilingual.onnx --out=./orchestrator-files/model/
#./node_modules/.bin/bf orchestrator:basemodel:get --versionId=pretrained.20210401.microsoft.dte.00.06.bert_example_ner_addon_free.en.onnx --out=./orchestrator-files/model/
#./node_modules/.bin/bf orchestrator:basemodel:get --versionId=pretrained.20200924.microsoft.dte.00.06.en.onnx --out=./orchestrator-files/model/
echo "Finished downloading model"
