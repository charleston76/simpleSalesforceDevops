const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
var classesPath = [];

async function getApexTestClass(manifestpath){
    
    // Start with the firt class folder
    fillClassPath('force-app/main/default/classes');
    // console.log('classesPath ' + JSON.stringify(classesPath) );

    var parser = new xml2js.Parser();
    var typeTmp = null;
    var classes = null;
    var classNameTmp = null;
    var testClasses = [];
    var xml = fs.readFileSync(manifestpath, "utf8");
    
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
            try {
                let blnFileChecked = false;
                for(var j = 0; j < classesPath.length; j++){
                    blnFileChecked = checkPathApexTestClass(classesPath[j],classNameTmp);
                    if (blnFileChecked){
                        testClasses.push(classNameTmp);
                        break;
                    }
                }
              } catch(err) {              
                console.log('Error ' , err)
              }
        }
    }
    
    return testClasses.join(",");
}

function checkPathApexTestClass(classesPath, classNameTmp){
    let fileContentTmp = null;

    try{
        fileContentTmp = fs.readFileSync(classesPath+"/"+classNameTmp+".cls", "utf8");
        if(fileContentTmp.toLowerCase().includes("@istest")) {
            return true;
        } else {
            return false;
        }
    } catch(err) {
        return false;
    }
}

async function fillClassPath(firtDir){
    const walkFolders = async (dir) =>{
        classesPath.push(dir);
        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            // If this entry is another directory check how deep it is
            if (d.isDirectory()){
                await walkFolders(entry);
            } 
        }
    }
    await walkFolders(firtDir);
}

const args = process.argv.slice(2);
var manifestpath = args[0];
getApexTestClass(manifestpath).then((SFDX_SPECIFIC_TEST_FOUND) => {
    console.log(SFDX_SPECIFIC_TEST_FOUND);
    return SFDX_SPECIFIC_TEST_FOUND;
});