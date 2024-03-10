# Infrastructure overview
![Network diagram detailing the server side setup](https://cdn.013.team/development/Screenshot-2023-11-30-010257.png)

There are also 2 other sites used as CDNS:
- cdn.013.team - used for hosting static web asssets (images, videos, icons etc)
- usercontent.013.team - used for hosting usercontent such as avatars etc.

# Infrastructure configuration
The api requires for each node to be able to include a php file containing secrets and config info using the following format:
```php
<?php
// infrastrucure
const MYSQL_DATABASE = "team013";
const MYSQL_USERNAME = "team013";
const MYSQL_PASSWORD = "database password";
const MYSQL_SERVER = "localhost";
const SESSION_VALIDATION_BASE = "http://localhost:4231/";

// encryption
const SESSION_SIGNING_ALGO = "sha3-256";
const SESSION_ENCRYPTION_ALGO = "aes-256-cbc";

const PASSWORD_RESET_ENCRYPTION_ALGO = "aes-256-cbc";
const PASSWORD_RESET_HMAC_ALGO = "sha3-256";

const EMAIL_VERIFY_ENCRYPTION_ALGO = "aes-256-cbc";
const EMAIL_VERIFY_SIGNING_ALGO = "sha3-256";

const SIGNUP_ENCRYPTION_ALGO = "aes-256-cbc";
const SIGNUP_SIGNING_ALGO = "sha3-256";


// both 256 bit keys
const SESSION_ENCRYPTION_KEY_HEX = "session encryption key";
const SESSION_SIGNING_KEY_HEX = "session signing key";

const PASSWORD_RESET_ENCRYPTION_KEY_HEX = "forgot password key";
const PASSWORD_RESET_HMAC_KEY_HEX = "forgot password signing key";

const EMAIL_VERIFY_ENCRYPTION_KEY_HEX = "";
const EMAIL_VERIFY_SIGNING_KEY_HEX = "";

const SIGNUP_ENCRYPTION_KEY_HEX = "";
const SIGNUP_SIGNING_KEY_HEX = "";


// gcp
const GCP_CREDENTIALS_OBJECT = Array(); // creds.json array form

const GOOGLE_ASSET_BUCKET_NAME = "usercontent.013.team"; // storage bucket name

// mailjet
const MAILJET_API_KEY = "";
const MAILJET_API_SECRET = "";
?>
```


# Run on local machine

## with production api

1. Install [PHP VS16 x64 Non Thread Safe](https://windows.php.net/download/)
2. Extract to `C:\php`
3. The repo comes with some run and debug configurations, select `php launch web server` for production api

    *navigate to http://localhost:8000*

The site should now function like normal on your local machine.

## setting up local api
1. change the php include path to include the api folder `include_path = ".;C:\..\githubrepo\api\"`
2. enable the openssl, curl, mysqli, mbstring, fileinfo extensions in php.ini
3. download the GTSRootR1 and Digicert GlobalRoot G2 certificate from [here](https://cdn.013.team/development/Roots.pem)
4. add the `curl.cainfo="path/to/certificate"` entry to the config under the `[curl]` heading
5. install [composer](https://getcomposer.org/Composer-Setup.exe)
6. install the composer packages by running composer update in /api
7. install [mariadb](https://mariadb.org/download/?t=mariadb&p=mariadb&r=10.11.7&os=windows&cpu=x86_64&pkg=msi&m=xtom_ams) and setup an account to access
8. create the secrets.php
   1. generate the encryption keys in a hex representation
   2. insert the database credentials you just created
9. import the database format (backups.013.team on gcp) using `mariadb --database team013 --user username123 --password=password123 < dump.sql`
10. instead of running the web server like above select `RUN GUTTED API`
11. the api will need a copy of the invalidation service running so make sure you can run (and possibly build) it
12. in global-api.js uncomment the const API_BASE and change it to the address of the php server you just started

# Developer Resources

[Documentation](https://github.com/lborocs/team-projects-part-2-team-013/tree/main/docs)
