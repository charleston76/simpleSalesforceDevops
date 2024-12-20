const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
var classesPath = [];

async function getApexTestClass(manifestpath, manifestTestpath) {
    // Start with the first class folder
    try {
        await fillClassPath('force-app/main/default/classes');
    } catch (error) {
        console.error(`Error reading classes directory: ${error.message}`);
        // If the directory does not exist, set CONTINUE_PROCESS to "false" and return
        return { testClasses: "", continueProcess: "false" };
    }

    var parser = new xml2js.Parser();
    var typeTmp = null;
    var classes = null;
    let justTestClasses = null;
    var classNameTmp = null;
    var testClasses = [];
    var xml = fs.readFileSync(manifestpath, "utf8");

    parser.parseString(xml, function (err, result) {
        for (var i in result.Package.types) {
            typeTmp = result.Package.types[i];
            //console.log('typeTmp ', typeTmp)
            if ("ApexClass" === typeTmp.name[0]) {
                classes = typeTmp.members;
            }
        }
    });

    // Variable to see if can continue, if don't have apex classes will continue
    let continueProcess = !classes ? "Does't needed" : fs.existsSync(manifestTestpath) ? "Found" : "Is missing";

    if (classes && continueProcess == "Found") {
        var testXml = fs.readFileSync(manifestTestpath, "utf8");

        // The classes will be read on the manifestTestpath
        parser.parseString(testXml, function (err, result) {
            for (var i in result.Package.types) {
                typeTmp = result.Package.types[i];
                //console.log('typeTmp ', typeTmp)
                if ("ApexClass" === typeTmp.name[0]) {
                    justTestClasses = typeTmp.members;
                }
            }
        });        

        // For each class found, checks if that really exists
        for (var i = 0; i < justTestClasses.length; i++) {
            classNameTmp = justTestClasses[i];

            try {
                let blnFileChecked = false;
                for (var j = 0; j < classesPath.length; j++) {
                    blnFileChecked = checkPathApexTestClass(classesPath[j], classNameTmp);
                    if (blnFileChecked) {
                        testClasses.push(classNameTmp);
                        break;
                    }
                }
            } catch (err) {
                console.log('Error ', err);
            }
        }

        // If arrived to this point, and don't have testClasses defined, something is wrong and shall not pass
        if (testClasses.length == 0 ) continueProcess = "Is missing";
    }

    // Return both values
    return { testClasses: testClasses.join(" "), continueProcess };
}

function checkPathApexTestClass(classesPath, classNameTmp) {
    let fileContentTmp = null;

    try {
        fileContentTmp = fs.readFileSync(classesPath + "/" + classNameTmp + ".cls", "utf8");
        if (fileContentTmp.toLowerCase().includes("@istest")) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

async function fillClassPath(firstDir) {
    const walkFolders = async (dir) => {
        classesPath.push(dir);
        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            if (d.isDirectory()) {
                await walkFolders(entry);
            }
        }
    }
    await walkFolders(firstDir);
}

const args = process.argv.slice(2);
var manifestpath = args[0];
var manifestTestpath = args[1];
getApexTestClass(manifestpath, manifestTestpath).then(({ testClasses, continueProcess }) => {
    console.log(testClasses);
    fs.writeFileSync(process.env.GITHUB_ENV, `SFDX_SPECIFIC_TEST_FOUND=${testClasses}\n`, { flag: 'a' });
    fs.writeFileSync(process.env.GITHUB_ENV, `CONTINUE_PROCESS=${continueProcess}\n`, { flag: 'a' });
});