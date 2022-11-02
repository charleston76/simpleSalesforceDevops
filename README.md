# Salesforce DevOps (CI/CD)

This repository shows the necessary things to get workflows and actions running on github.
For bitbucket the things are almost the same, the only difference will be:
* Github calls it as **actions**;
* Bitbuckt calls it as **workflows**;

For sure, the configuration part are not the same in both, but *understanding the idea explained here*, you can do it.

Despite the activities done here are a little bit different of this one, you can [check on trailhead](https://trailhead.salesforce.com/content/learn/modules/git-and-git-hub-basics), some steps are very similar and that trail could be a good starting point, since the real one I was looking for (related with CI/CD), is not available anymore (at least, I have not found).

Well, we'll do deployments directly with pull request, passing by the following environments:
1. Scratch orgs (CI);
1. Developer orgs (CD), and... 
1. Over again in developer org mimicking an production org.

Of course, instead of scratches and developer orgs, you'll be able to do the same on sandboxes and production orgs.

To use this guidance, we are expecting that you are comfortable with:
* [Salesforce DX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx);
* [Salesforce CLI features](https://developer.salesforce.com/tools/sfdxcli);
* [Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs.htm);
* [Git CLI](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line);

## First things first: Local environment

In your workstation, you need to have at least the following softwares installed:

* Salesforce CLI
* Salesforce [SFDX Commerce Plugin](https://github.com/forcedotcom/sfdx-1commerce-plugin)
* Visual Studio Code with the pluggins below:
    * GitLens;
    * Salesforce Extension Pack;
    * Salesforce CLI Integration;
    * Salesforce Package.xml Generator Extension for VS Code (we'll not use it here, but it will help you to know);

## Devhub setup

For sake of time and avoiding be redundant, please take a look on the [Setup section of this other repository](https://github.com/charleston76/b2bSimpleTemplate/blob/main/README.md).
There you'll find how to setup and authorize scratch orgs, dev hub, etc...

When you have the things configured, let's rock!

## 01 Create a connected APP

To give access to the github actions, first of all you need create the "connected app" allowing it perform some activities in your environment.

**Spoiler alert**: You can configure there in your environment, or just deploy the one [we have created here](force-app/main/default/connectedApps/DX_Pipeline_Deployment_Authentication.connectedApp-meta.xml)!

You will continue needing create certification file (server.crt), but we'll talk about it soon.

It is a good practice create an user to do that, for example:

    GitHubSandbox 1 User - GitHubSandbox1@deployer.com
    GitHubSandbox 2 User - GitHubSandbox2@deployer.com

If you already did the deployment adjusting and [using this file](force-app/main/default/connectedApps/DX_Pipeline_Deployment_Authentication.connectedApp-meta.xml), you can jump to the step [3 - Create Private Key and Digital Certificate](#3---create-private-key-and-digital-certificate), otherwise, follow the steps below:

## 1 - Configure the connected app

From Setup, enter App Manager in the Quick Find box, select App Manager and click on "New Connected App"
1. Connected App Name: DX Pipeline Deployment Authentication (or wherever you want)
    1. API Name: CAM_GitHubConnectedApp (CAM stands for Connected App Manager)
    1. Enable OAuth Settings: Checked
    1. Callback URL: http://localhost:1717/OauthRedirect
    1. Selected OAuth Scopes:  
        1. Access and manage your data (api)
        1. Perform requests on your behalf at any time (refresh_token, offline_access)
        1. Provide access to your data via the Web (web)
    1. Require Secret for Web Server Flow: checked
    1. Save, then Continue.
1. Take notes of yours "Consumer Key" (Client ID) and "Consumer Secret" (Client Secret)

## 2 - Install OpenSSL

The steps below will work for windows user only, but for linux or mac, you just need adjust some steps.

1. If you don't have, Download a version for your operating system from https://www.openssl.org/community/binaries.html. 
1. Unzip the OpenSSL file.
1. Add the absolute path to the unzipped OpenSSL folder to your Windows PATH environment variable.
1. Open Control Panel then click System, Advanced System Settings, then Environment Variables.
1. Select the PATH variable then click Edit.
1. Add the absolute path to your OpenSSL folder to the front of the existing PATH value, separating the two values by a semi-colon ;
1. Click OK then OK.
1. Restart your command prompt to pick up the new PATH changes.
1. Enter openssl in your Terminal (macOS) or Command Prompt (Windows) to confirm that OpenSSL has been installed. You see something like the following.
        OpenSSL>
1. Enter version and confirm OpenSSL version 1.1 was installed and your PATH environment variable was updated correctly.
1. Enter q to exit the OpenSSL prompt.

## 3 - Create Private Key and Digital Certificate

1. Create a Certificate folder (better do that outside of the repository, for security reasons);
1. From within the Certificate folder, generate an RSA private key.
    ```
    openssl genrsa -des3 -passout pass:SomePassword -out server.pass.key 4096
    ```

1. Create a key file from the server.pass.key file. Use the same password from the prior command.
        openssl rsa -passin pass:SomePassword -in server.pass.key -out server.key
    04 - Delete the server.pass.key file. It's no longer needed.
        del server.pass.key
    05 - On Windows, you may need to set the environment variable OPENSSL_CONF to the absolute path to your openssl.cnf or openssl.cfg file within the directory where you installed OpenSSL.
        If your OpenSSL installation directory or one of its sub-directories doesn't have an openssl.cnf file, sometimes the configuration file is named openssl.cfg:
            set OPENSSL_CONF=C:\PathToOpenSSL\openssl.cnf
        (You need restart the command prompt)
    06 - Generate a certificate signing request using the server.key file. Store the certificate signing request in a file called server.csr. Enter information about your company when prompted. 
        Request and generate the certificate.
            openssl req -new -key server.key -out server.csr
        
        Enter the information needed
        Country Name (2 letter code)                BR
        State or Province Name (full name)          SP
        Locality Name (eg, city)                    Barueri
        Organization Name (eg, company)             Total IT
        Organizational Unit Name (eg, section)      Total IT
        Common Name (eg, fully qualified host name) TotalIT.DevOps
        Email Address                               Enter your email address.
        Password                                    Press Enter to indicate no password.
        Company Name                                Press Enter to indicate no company name.
    07 - Generate the SSL certificate. It's generated from the server.key private key and server.csr files.
        openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
    08 - Encrypt the server.key file so that you can safely add it to your Git repository in the next step. For the -k argument, you can choose a different password other than SomePassword.
        openssl enc -aes-256-cbc -md sha256 -salt -e -in server.key -out server.key.enc -k SomePassword -pbkdf2
    
    Until here, your certificates folder should contain the following files:
        server.crt
        server.csr
        server.key
        server.key.enc

        09 - Add Encrypted Key to Your Project
            You can create a DevOps folder name (or which one do you want) and copy the encrypted files to it
                a - Access you project folder
                b - mkdir DevOps
                c - cd DevOps
                d- copy ..\..\Certificates\server.key.enc .


<!-- 

# Destructive 
    # The package need to be in the destructive folder
    --sfdx force:mdapi:deploy -d destructive -g -w 10




## 04 Add Digital Certificate to Your Connected App
    1 - Open the connected App created before
    2 - Under the API (Enable OAuth Settings) section, check the Use digital signatures box. This enables you to upload the certificate.
    3 - Click Choose File and select the server.crt file that you created in the certificates folder.
        Certificates\server.crt
    4 - Click Save, then Continue.

## 05 Check if the login was defined correctly
Check Your Work

## Actions
    The next steps will have to do with Github actions
        https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions
    
    In your repository, create the .github/workflows/ directory to store your workflow files.
    In the .github/workflows/ directory, create a new file
        feature-rm-onpush.yml 
    and add the following code.
 -->
