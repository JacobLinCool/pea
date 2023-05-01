<div align="center">

# PEA

_Pure Email Auth._

![icon](static/icon-256.png)

</div>

## Features

- [x] Authenticate users with organization email.
- [x] Fully serverless.
- [x] A developer dashboard for managing applications.
- [x] A public showboard for each developer.

> Using PEA, all of your users' email addresses are verified by nature.

> You can use [D1 Manager](https://github.com/JacobLinCool/d1-manager) to manage your D1 database.

## Setup

1. `wrangler d1 create pea` to create a Cloudflare D1 database.
2. Fork this repository.
3. Create a new Cloudflare Pages project with the forked repository.
4. Setup the environment variables and D1 binding in the Cloudflare Pages project.
5. Trigger `/api/sys/setup` to check if the setup is successful.

## Configuration

PEA uses environment variables for configuration by default.

> **TODO** However, if the value of an environment variable is set to `DYNAMIC`, PEA will try to load the value from the runtime storage backend (e.g. Cloudflare D1).

| Name             | Description                                                  | Example             |
| ---------------- | ------------------------------------------------------------ | ------------------- |
| `PEA_APP_SECRET` | A secret string used to sign the JWT token.                  | `MY_PEA_APP_SECRET` |
| `PEA_APP_EMAIL`  | The email address of the PEA Authentication.                 | `pea@csie.cool`     |
| `PEA_ALLOWLIST`  | A comma-separated list of RegExp strings to match the email. | `^.*@csie\.cool$`   |

## Authentication Model

### For Application Developers

#### Simple Model

> Suitable for most applications.

1. Create an application on PEA with the JWT secret and application domain(s).
2. Add an input field in your application for the user to enter the email address.
3. Send a auth request to PEA with the user email and callback URL.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@csie.cool", "callback": "https://your.app/callback/url"}' \
    https://pea.cool/api/app/your-app-id/login
```

Then, PEA will send an email to the user with the callback URL and a JWT token in the following format:

```bash
https://your.app/callback/url?token=<JWT_TOKEN>
```

#### Extended Model

In the extended model, the PEA is responsible for verifying the email address and login the user.

You can:

1. Retrieve the JWT from the frontend callback URL
2. Verify it on the backend using the same secret
3. "Upgrade" the JWT with additional informations
4. Send the "upgraded" JWT to the frontend and replace the old one

### For Users

1. Open the application you want to log in to.
2. Enter your email address and click the login button (or something similar).
3. Receive an email from PEA and click the link in the email.
4. Done! You are now logged in to the application.
