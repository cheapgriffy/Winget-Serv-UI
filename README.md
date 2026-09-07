

<img width="420" height="120" alt="Pipeline_logo" src="https://github.com/user-attachments/assets/102fb072-e0d2-4a37-80d9-6337c425d709" />

# Script hosting web application

## Description
Pipeline is a script hosting service,

It reduce friction when hosting public or shareable scripts
by creating links serving directly the script, and giving a custom command to execute any remote script from one simple command.

Create scripts directly on the app, or upload your file.
Execute them on your favorite shell.


### Executable script exapmles

Powershell : `irm https://script.cheapgriffy.com/api/script/B50VTRV4 | iex`

Bash : `curl -fsSL https://script.cheapgriffy.com/api/script/B50VTRV4 | bash`


## Setup

```bash
npm install
cp .env-template .env
# Edit .env and set VITE_API_URL to your API base URL
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

#### Do not forget to edit `.env-template` values before building

Building generates the `./dist/` directory in the project root.
Use this output with your preferred web server.
_This was only tested on Apache 2 so far; if you run into issues with other servers, please check your server configuration._

## Project structure

```
src/
├── api/                    # Axios API layer (auth + scripts)
├── assets/                 # Global CSS variables & styles
├── components/
│   ├── ScriptCard.vue      # Expandable script row (view/copy/edit/delete)
│   └── ScriptModal.vue     # Create / edit modal with line editor
├── router/                 # Vue Router (login guard + auth guard)
├── stores/
│   ├── auth.js             # Pinia auth store (login, register, me, logout)
│   └── scripts.js          # Pinia scripts store (list, create, remove)
├── test/                   # Jest unit tests for stores
├── views/
│   ├── LoginView.vue       # Login + Register (toggled form)
│   └── DashboardView.vue   # Scripts dashboard + Profile tab
├── App.vue                 # Root Vue component
└── main.js                 # App bootstrap and router/pinia setup
```

## Features

- **Login / Register** on one page with animated tab switch
- **Scripts list** with search/filter
- **Create script** with multi-line editor (Enter = new line, Backspace on empty = remove)
- **View script** expanded card showing content + copy-ready exec command
- **Edit script** — re-opens modal pre-filled
- **Delete script** — inline confirm guard
- **Profile tab** — user info + account deletion
- Token stored in `localStorage`, auto-attached via Axios interceptor
