<div align="center">

# PEA

_Pure Email Auth._

![icon](static/icon-256.png)

</div>

## Features

- [x] Authenticate users with email.
- [x] Restrict the email domain(s) / pattern(s) of the users.
- [x] Support multiple applications.
- [x] Asymmetric JWT signing.
- [x] Fully serverless.
- [x] A developer dashboard for managing applications.
- [x] A public showboard for each developer.

> Using PEA, all of your users' email addresses are verified by nature.

> You can use [D1 Manager](https://github.com/JacobLinCool/d1-manager) to manage the underlying D1 database.

## Setup

Requirements:

- A Cloudflare account (with a domain, so we can send emails)
- A Cloudflare D1 database

1. Execute the SQL in [here](prisma/migrations/20230608181442_init/migration.sql) in your D1 database to create the tables.
2. Fork this repository.
3. Create a new Cloudflare Pages project with the forked repository.
4. Setup the environment variables and D1 binding (`D1`) in the Cloudflare Pages project.
5. Trigger `/api/sys/setup` to check if the setup is successful.

## Configuration

PEA uses environment variables for some configurations.

| Name            | Description                                            | Example         |
| --------------- | ------------------------------------------------------ | --------------- |
| `PEA_APP_EMAIL` | The email address of the system use for sending email. | `pea@csie.cool` |

## Authentication Model

### For Application Developers

After creating an application on PEA, you can use the provided login page or the API to authenticate users.

The provided login page is located at `/app/<your-app>` and you can use the `cb` query parameters to customize the callback URL, for example `/app/your-app?cb=https://your.app/callback/url`.

You can also use the API to authenticate users. The API is located at `/api/app/<your-app>/login` and you can use the `callback` field in the request body to customize the callback URL.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@csie.cool", "callback": "https://your.app/callback/url"}' \
    https://pea.csie.cool/api/app/your-app-id/login
```

Then, PEA will send an email to the user with the callback URL and a JWT token in the following format:

```bash
https://your.app/callback/url?token=<JWT_TOKEN>
```

> Both methods require the callback URL matches the pattern in the application settings.

### For Users

1. Open the application you want to log in to.
2. Enter your email address and click the login button (or something similar).
3. Receive an email from PEA and click the link in the email.
4. Done! You are now logged in to the application.
