//fs = require('fs');
const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    let packageTest = 'manifest/packageTest.xml';
    let startMember = '<members>';
    let testclasses = '';
    let rowLength = 0;
    let intCount = 0;
    const FILE_NAME_TO_SAVE = 'SPECIFIC_TEST_FOUND.txt';

    //console.log('packageTest ' + packageTest);
    const fileStream = fs.createReadStream(packageTest);
    //console.log('fileStream ' + fileStream);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    //console.log('rl ' + rl);
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in the file will be successively available here as 'line'.
        //console.log(`Line from file: ${line}`);
        //console.log('startMember ' + startMember);
        //console.log('line.indexOf(startMember) ' + line.indexOf(startMember));
        
        if(line.indexOf(startMember) >0){
            let strLine = line.trim();
            
            let startIndex = (strLine.indexOf(startMember) +9);
            //console.log('startIndex ' + startIndex);
            //console.log('strLine.length ' + strLine.length);
            rowLength = (strLine.length - (startIndex +1));
            //console.log('rowLength ' + rowLength);
            if (intCount === 0){
                testclasses = '-r ' + strLine.substring(startIndex, rowLength);
            }else{
                testclasses += ',' + strLine.substring(startIndex, rowLength);
            }
            intCount++;
            //console.log('testclasses ' + testclasses);
        }
    }

    fs.writeFile(FILE_NAME_TO_SAVE, testclasses, function (err) {
      if (err) return console.log(err);
      console.log('Saved ' + FILE_NAME_TO_SAVE);
    });    
    return testclasses;
}

module.exports.SPECIFIC_TEST_FOUND = processLineByLine();