# tools-notes

### install

`npm install`

### config

use the default `.env` file which include an auth token - if the service auth is enabled (it is disabled by default)

### run

`node socket-cli.js`

This will start a REPL that will accept utterances and return the orchestrator classification results:

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
