# Monitoring App with Node Js

An App hooked up to use Twilio API for sending text messages and Send Grid API for sending email. The App takes a URL as input and sends you a text message or an email when a request to the URL returns a response code doesnot match the expected.

## System Requirements

* [git][git]
* [NodeJS][node] v10.x or greater

All of these must be available in your `PATH`. To verify things are set up
properly, you can run this:

```
git --version
node --version
```

If you have trouble with any of these, learn more about the PATH environment
variable and how to fix it here for [windows][win-path] or
[mac/linux][mac-path].

## Setup

After you've made sure to have the correct things (and versions) installed, you
should be able to just run a few commands to get set up:

### Clone Repo

```
git clone https://github.com/Sulaiman-Mozes/Downtime-Alerter-With-Node.git
```

### Export the following Application environment variables
- For Staging
  ```
  NODE_ENV = 'staging'
  HTTP_PORT = 3000,
  HTTPS_PORT = 3001,
  ENV_NAME = 'staging',
  MAX_CHECKS_LIMIT = 5,
  SECRET_KEY = 'secret',
  TWILIO_ACCOUNT_SID = '',
  TWILIO_AUTH_TOKEN = '',
  TWILIO_NUMBER = '',
  SEND_GRID_API_KEY = '',
  ```

- For Production
  ```
  NODE_ENV = 'production'
  PROD_HTTP_PORT = 5000,
  PROD_HTTPS_PORT = 5001,
  PROD_ENV_NAME = 'production',
  PROD_MAX_CHECKS_LIMIT = 5,
  PROD_SECRET_KEY = 'secret',
  PROD_TWILIO_ACCOUNT_SID = '',
  PROD_TWILIO_AUTH_TOKEN = '',
  PROD_TWILIO_NUMBER = '',
  PROD_SEND_GRID_API_KEY = '',
  ```

### Create Data Directories
```shell
node script.js
```

### Generate Keys and Certificates
- Generate SSL certificate
  
  For Mac
  ```
  cd keys
  
  openssl req -x509 -newkey rsa:4096 -days 365 -keyout key.pem -out cert.pem -nodes

  ```

- Generate Keys For Asymmetric JWT Implementation

  ```
  openssl genrsa -out private.pem 2048

  openssl rsa -in private.pem -outform PEM -pubout -out public.pem
  ```

## Running the app

To get the app up and running, 
```
cd <app root dir>
```

run:

```shell
node index.js
```

## Running the tests



## Built with
- Node
- Javascript

## Contribution guide

#### Contributing
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.This Project shall be utilising a [GitHub Issues](https://github.com/Sulaiman-Mozes/Downtime-Alerter-With-Node/issues) to track  the work done.

 #### Pull Request Process
- A contributor shall identify a task to be done from the [GitHub Issues](https://github.com/Sulaiman-Mozes/Downtime-Alerter-With-Node/issues) .If there is a bug , feature or chore that has not be included among the tasks, the contributor can add it only after consulting the owner of this repository and the task being accepted.
- The Contributor shall then create a branch off  the `master` branch where they are expected to undertake the task they have chosen.
- After  undertaking the task, a fully detailed pull request shall be submitted to the owners of this repository for review.
- If there any changes requested, it is expected that these changes shall be effected and the pull request resubmitted for review. Once all the changes are accepted, the pull request shall be closed and the changes merged into `master` by the owners of this repository.

[node]: https://nodejs.org
[git]: https://git-scm.com/
[win-path]: https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/
[mac-path]: http://stackoverflow.com/a/24322978/971592
