const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');

async function getApexTestClass(manifestpath){
    var classesPath = 'force-app/main/default/classes';

    var parser = new xml2js.Parser();
    var typeTmp = null;
    var classes = null;
    var classNameTmp = null;
    var testClasses = [];
    var xml = fs.readFileSync(manifestpath, "utf8");
    var fileContentTmp = null;

    parser.parseString(xml, function (err, result) {
        for(var i in result.Package.types){
            typeTmp = result.Package.types[i];
            //console.log('typeTmp ', typeTmp)
            if("ApexClass" === typeTmp.name[0]){
                classes = typeTmp.members;
                //console.log('classes ', classes)
            }
        }
    });

    if(classes){
        for(var i = 0; i < classes.length; i++){
            classNameTmp = classes[i];
            classNameTmp+= 'Test'
            //console.log('classNameTmp ', classNameTmp)
            try {
                fileContentTmp = fs.readFileSync(classesPath+"/"+classNameTmp+".cls", "utf8");
                if(fileContentTmp.toLowerCase().includes("@istest")){
                    testClasses.push(classNameTmp);
                }
              }
              catch(err) {
                //console.log('Test file not found',classesPath+"/"+classNameTmp+".cls")
              }
        }
    }
    
    return testClasses.join(",");
}
//module.exports.SPECIFIC_TEST_FOUND = getApexTestClass();
const args = process.argv.slice(2);
var manifestpath = args[0];
getApexTestClass(manifestpath).then((SFDX_SPECIFIC_TEST_FOUND) => {
    console.log(SFDX_SPECIFIC_TEST_FOUND);
    return SFDX_SPECIFIC_TEST_FOUND;
  });