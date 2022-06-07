const events = require('events');
const fs = require('fs-extra');
const readline = require('readline');

let sourceModelPath = './lu/Dispatch/SmallTalk.lu'
let outputDirectory = './lu/SmallTalk/'

async function intentsToLuFiles() {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(sourceModelPath),
            crlfDelay: Infinity
        });

        fs.rmSync(outputDirectory, { recursive: true, force: true });
        fs.ensureDirSync(outputDirectory)

        let count = 0;
        let currentFilepath;
        rl.on('line', (line) => {
            // console.log(line)
            if (line.substring(0, 1) === '>' || line.substring(0, 1) === '') {
                // console.log(`skipping: ${line}`)
            } else if (line.substring(0, 2) === '##') {
                count++
                let intent = line.split('##')[1].trim()
                currentFilepath = outputDirectory + intent + '.lu'
                console.log(`Writing: ${currentFilepath}`)
                fs.appendFileSync(currentFilepath, '## ' + intent + '\n')
            } else if (line.substring(0, 1) === '-') {
                let sample = line.split('-')[1].trim()
                fs.appendFileSync(currentFilepath, '- ' + sample + '\n')
            }
        });

        await events.once(rl, 'close');
        console.log(`Wrote ${count} .lu files to: ${outputDirectory}`);

    } catch (err) {
        console.error(err);
    }
}

async function doIt() {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    console.log(`Splitting ${sourceModelPath} into invidual .lu files...`)
    await intentsToLuFiles()
    console.log('Done.')
}

doIt()
