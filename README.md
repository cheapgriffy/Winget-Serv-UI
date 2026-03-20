# introduction

A Claude.ai based UI, for my [Winget_Server_API](https://github.com/cheapgriffy/Winget-Serv-Server) as a test for claude capabilities.
Sadly to get a live view of available ``winget`` packages,
Would be hard to implement cause want to put that inside a bash based machine

# Winget-Serv UI

Vue 3 + Vite frontend for the Winget-Serv API.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_API_URL to your API base URL
npm run dev
```

## Build

```bash
npm run build
```

## Project structure

```
src/
├── api/          # Axios API layer (auth + scripts)
├── assets/       # Global CSS variables & styles
├── components/
│   ├── ScriptCard.vue    # Expandable script row (view/copy/edit/delete)
│   └── ScriptModal.vue   # Create / edit modal with line editor
├── router/       # Vue Router (login guard + auth guard)
├── stores/
│   ├── auth.js   # Pinia auth store (login, register, me, logout)
│   └── scripts.js # Pinia scripts store (list, create, remove)
└── views/
    ├── LoginView.vue     # Login + Register (toggled form)
    └── DashboardView.vue # Scripts dashboard + Profile tab
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