const jsonfile = require('jsonfile');
const axios = require('axios');

let authUrl = 'http://localhost:8000/auth'
let microserviceUrl = 'http://localhost:8000/intent'
let manifestPath = './orchestrator-files/test-manifests/SmallTalk-manifest.json'
let resolverName = '2-Stage'

const getToken = (username, password) => {
    return new Promise((resolve, reject) => {
            axios.post(authUrl, {
                username,
                password
            },
            {
                headers: { 'Content-Type': 'application/json'}
            })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                    reject();
                });

        });
}

const callMicroservice = (utterance, resolverName, accessToken) => {
    return new Promise((resolve, reject) => {
            axios.post(microserviceUrl, {
                utterance,
                resolverName
            },
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                    reject();
                });

        });
}

async function runMicroserviceTests(manifestPath, resolver, accessToken) {
    const manifest = jsonfile.readFileSync(manifestPath);
    let testCount = manifest.tests.length;
    let testMax = testCount;
    let errors = 0;
    let startTime = new Date().getTime();
    for (let i=0; i<testMax; i++) {
        const test = manifest.tests[i];
        const expectedLabel = test.label;
        const results = await callMicroservice(test.utterance, resolver, accessToken)
        const actualLabel = results[0].label.name;
        if (expectedLabel != actualLabel) {
            errors += 1;
            console.log(`Error: ${errors}: Expected ${expectedLabel} but got ${actualLabel}\n  "${test.utterance}" -> closest: "${results[0].closest_text}"`); 
        } else {
            // console.log(`OK: Expected ${expectedLabel} and got ${actualLabel}\n  "${test.utterance}" -> closest: "${results[0].closest_text}"`); 
        }
    }
    elapsedTime = new Date().getTime() - startTime;
    console.log(`manifestPath: ${manifestPath}`)
    console.log(`resolverName: ${resolverName}`)
    console.log(`${testCount} tests completed in ${elapsedTime}ms. Average test time: ${elapsedTime / (testCount)}ms`);
    console.log(`${errors} errors.`);
}



async function doIt() {
    const tokenData = await getToken('testUser', 'asdfzxcv')
    const accessToken = tokenData.access_token;
    // const testResult = await callMicroservice('do you celebrate easter', '2-Stage', accessToken)
    // console.log(testResult)
    runMicroserviceTests(manifestPath, resolverName, accessToken)
}

doIt()
