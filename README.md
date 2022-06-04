# orchestrator-microservice

Orchestrator is dnn-based intent clasifier made available as part of the Microsoft Bot Framework.

This microservice wraps the `@microsoft/orchestrator-core` module and exposes both an HTTP and WebSocket interface.

### microservice-template

This microservice is based on: https://github.com/wwlib/microservice-template


### Orchestrator (c) Microsoft

Orchestrator is (c) Microsoft and is intended "For use with Azure Services". See the Orchestrator license:

[orchestrator license](./orchestrator-files/model/LICENSE.md)

### install

`npm install`
### build

`npm run build`

### download the dnn model (.onnx) file(s)

`sh ./orchestrator-files/downloadModel.sh`
- or `npm run get-model`

Downloads `./orchestrator-files/model/model.onnx` and supporting files

### generate the snapshot (.blu) files 

`sh ./orchestrator-files/generateSnapshots.sh`
- or `npm run generate`

Generates `./orchestrator-files/blu/Dispatch.blu` and `./orchestrator-files/blu/SmallTalk.blu`


### usage via the bot framework cli: bf

Use the bf cli to query the model:

```
npx bf orchestrator:query --in=./orchestrator-files/blu/Dispatch.blu --query="what time is it" --model=./orchestrator-files/model

npx bf orchestrator:query --in=./orchestrator-files/blu/Dispatch.blu --query="do you like ice cream" --model=./orchestrator-files/model
```

Note: npx invokes bf installed in the project's node_modules folder

### start the microservice

`npm run start`

### usage via curl

```
curl --location --request POST 'http://localhost:8000/intent' \
     --header 'Content-Type: application/json' \
     --data-raw '{
       "utterance": "what do you want to do today",
       "resolverName": "Dispatch"
     }'
```

### usage via http

http://localhost:8000/orchestrator/intent?utterance=what%20time%20is%20it

### usage via socket client

```
cd tools
npm install
node socket-client.js
```

```
> what time is it

[
  {
    "closest_text": "what time is it",
    "score": 0.9997169968564052,
    "label": {
      "name": "Time",
      "label_type": 1,
      "span": {
        "length": 15,
        "offset": 0
      }
    },
    "processingTime": 1
  },
  ...
]

label: Time, closest_text: what time is it, score: 0.9997169968564052, processingTime: 1 ms
> 
```

### docker

`docker build -t orchestrator-microservice .`
- or `npm run docker:build`

Create `.env`
```
SERVER_PORT=8000
USE_AUTH=false
```

`docker run -it --rm -p 8000:8000 --env-file ./.env orchestrator-microservice`
- or `npm run docker:run`

2gb should be enought to run the `pretrained.20200924.microsoft.dte.00.06.en.onnx` model.

However, if more memory is needed try something like:

`docker run -it -m=4g --rm -p 8000:8000 --env-file ./.env orchestrator-microservice`


### dowloading models with bf cli

List the available models:

`npx bf orchestrator:basemodel:list`

Get an available model:

`npx bf orchestrator:basemodel:get --versionId=pretrained.20200924.microsoft.dte.00.06.en.onnx --out=/usr/app/orchestrator-files/model/`



### run example tests

`cd orchestrator-files && node test.js`

```
Initializing model ...
... model initialization complete.
Starting tests ...
OK: Expected Fitness and got Fitness - let's do some yoga
OK: Expected Fitness and got Fitness - do you like yoga
OK: Expected Fitness and got Fitness - teach me some yoga
3 tests completed in 39ms. Average test time: 19.5ms
0 errors.
```
