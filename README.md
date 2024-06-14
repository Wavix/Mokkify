[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub package.json version](https://img.shields.io/github/package-json/v/icevl/mokkify)
![GitHub last commit](https://img.shields.io/github/last-commit/icevl/mokkify)


# Mokkify

Welcome to **Mokkify** - a self-hosted RestAPI mocking service built with Next.js. Mokkify provides a flexible response builder and templating system for crafting your mocks, as well as support for Relay requests to an external hook to simulate various scenarios, like DLR. We've done our best to make the interface intuitive and easy to use.

[Demo](https://demo.mokkify.dev) admin / admin

## Features

- 🔁 RestAPI mocking
- 🏗️ Self-hosted
- ⚡ Caching requests. Throughput up to 600 qps
- 🧩 Flexible response builder and templates
- ⏲️ Response delay emulation
- 🔄 Relay request support with external hooks
- 🔮 Intuitive interface
- 🔐 Authorization
- 📈 Endpoint RPS graphics
- 🗄️ Dump and restore configuration

![Interface example](https://i.imgur.com/KszL9Hb.png)

## Requirements
- Sqlite3

## Installation & Running

First, clone the repository:

```bash
git clone https://github.com/Wavix/Mokkify.git
```

Then, navigate to the project directory and install the necessary dependencies:

```bash
cd mokkify
pnpm install
pnpm cli dbcreate
pnpm cli useradd <login> <password>
```

After that, start the project in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Nginx config for deployment

```
upstream webhook {
  server 127.0.0.1:7043;
}

location / {
    proxy_set_header Host <Your host>;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://webhook;
  }
```

## Support and Contributions

If you encounter any issues or have questions about using Mokkify, please create an "Issue" in this repository, and we'll be glad to assist you.

If you wish to contribute to the project's development, feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more information.

