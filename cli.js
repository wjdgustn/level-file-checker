const fs = require('fs');
const readline = require('readline');

const utils = require('./utils');
const { inputs } = require('./cli_input.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = [];

process.stdout.write(inputs[0]);

rl.on('line', line => {
    input.push(line);
    if(input.length < inputs.length) process.stdout.write(inputs[input.length]);
    else rl.close();
}).on('close', () => {
    if(input.length < inputs.length) {
        console.log('\n\n확인을 취소합니다.');
        process.exit(0);
    }

    let file;
    try {
        file = fs.readFileSync(input[0]);
    } catch(e) {
        console.error('해당 파일을 열 수 없습니다. 파일이 존재하지 않을 수 있습니다.');
        process.exit(1);
    }
    const level = utils.ADOFAIParser(file);

    const all_file = fs.readdirSync('./').filter(a => !a.endsWith('.adofai') && !a.endsWith('.exe') && !a.endsWith('.ogg'));
    const all_required_file = [];
    const file_usage = {};

    all_file.splice(all_file.indexOf(level.settings.artistPermission), 1);
    all_file.splice(all_file.indexOf(level.settings.previewImage), 1);
    all_file.splice(all_file.indexOf(level.settings.previewIcon), 1);
    all_file.splice(all_file.indexOf(level.settings.bgImage), 1);

    const EventFilter = [ 'AddDecoration' , 'MoveDecorations' , 'CustomBackground' ];
    for(let e of level.actions.filter(e => EventFilter.includes(e.eventType))) {
        const filename = e.decText || e.bgImage || e.decorationImage;
        if(!filename) continue;
        if(!all_required_file.includes(filename)) all_required_file.push(filename);
        if(!file_usage[filename]) file_usage[filename] = [e.floor];
        else if(!file_usage[filename].includes(e.floor)) file_usage[filename].push(e.floor);
    }

    const missing_file = all_required_file.filter(f => !fs.existsSync(f));
    const unnecessary_file = all_file.filter(f => !all_required_file.includes(f));

    console.log(`==RESULT==\n\nMissing:\n${missing_file.map(s => `    * ${s}\n          Used tile --> ${file_usage[s].join(', ')}`).join('\n')}\nUnnecessary:\n${unnecessary_file.map(s => `    * ${s}`).join('\n')}`);

    console.log('\nEnter를 눌러 종료하세요.');
    const pause = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('line', () => pause.close());
});