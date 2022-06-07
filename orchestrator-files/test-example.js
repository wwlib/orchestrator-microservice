const path = require('path');
const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const oc = require('@microsoft/orchestrator-core');

const modelFolder = './model';
const snapshotFile = './blu/Dispatch.blu';

let orchestrator = null;
let resolver = null;

const initializeModel = () => {
    if (!modelFolder) {
        throw new Error(`Missing "ModelFolder" information.`);
    }

    if (!snapshotFile) {
        throw new Error(`Missing "ShapshotFile" information.`);
    }

    // Create orchestrator core
    const modelFolderPath = path.resolve(modelFolder);
    if (!fs.existsSync(modelFolderPath)) {
        throw new Error(`Model folder does not exist at ${modelFolderPath}.`);
    }

    orchestrator = new oc.Orchestrator();
    if (!orchestrator.load(modelFolderPath)) {
        throw new Error(`Model load failed - model folder ${modelFolderPath}.`);
    }

    if (!resolver) {
        const snapshotFilePath = path.resolve(snapshotFile);
        if (!fs.existsSync(snapshotFilePath)) {
            throw new Error(`Snapshot file does not exist at ${snapshotFilePath}.`);
        }
        // Load the snapshot
        const snapshot = fs.readFileSync(snapshotFilePath);

        // Load snapshot and create resolver
        resolver = orchestrator.createLabelResolver(snapshot);
    }
}

console.log('Initializing model ...');
initializeModel();
console.log('... model initialization complete.');

const modelName = 'Fitness';
const fitnessManifest = jsonfile.readFileSync(`./test-manifests/${modelName}-manifest.json`);
// console.log(fitnessManifest.tests.slice(0,3));

console.log('Starting tests ...');
const testCount = fitnessManifest.tests.length;
const testMax = testCount;
let errors = 0;
let startTime = new Date().getTime();
let i = 0
for (i=0; i<testMax; i++) {
    const test = fitnessManifest.tests[i];
    const expectedModel = modelName; // test.intent;
    const results = resolver.score(test.utterance, 1);
    const actualModel = results[0].label.name;
    if (expectedModel != actualModel) {
        errors += 1;
        console.log(`Error: ${errors}: ${actualModel} should be ${expectedModel} - ${test.utterance}`); 
    } else {
        console.log(`OK: Expected ${expectedModel} and got ${actualModel} - ${test.utterance}`); 
    }
}
const elapsedTime = new Date().getTime() - startTime;
console.log(`${i} tests completed in ${elapsedTime}ms. Average test time: ${elapsedTime / (i-1)}ms`);
console.log(`${errors} errors.`);
