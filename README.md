# Netko

Welcome to **Netko** — your digital laboratory for AI banter and multi-LLM mischief! 🧪💬

Ever wanted to wrangle a squad of language models, sync your wildest conversations, and experiment with the bleeding edge of AI—all in one stylish playground? You're in the right timeline. Built for the T3 Chat Cloneathon, Netko is where ideas spark, personalities (AI and human) collide, and inspiration is just one message away.

> ⚡️ Side effects may include spontaneous brainstorming, worldline shifts, and the urge to build something cool.

---

## 🚀 Features

- **Multi-LLM Playground:**  
  Chat with a whole crew of language models (LLMs) — swap between them like you're flipping channels in the multiverse! 🌌
- **Conversation Sync:**  
  Your chat history and threads are always saved — never lose a vital message, even if you accidentally diverge from the main worldline. 🕰️💾
- **Modern UI:**  
  Modular, reusable, and as smooth as a well-oiled gadget. Powered by shadcn/ui. 🎛️✨
- **Experimentation Hub:**  
  Try out new models, prompts, and features in a safe, sandboxed environment. Go wild — we won't judge. 🧑‍🔬🧪

---

## 🧪 Tech Stack

- **Frontend & App Runtime:**  
  - [React](https://react.dev/) with [@tanstack/react-router](https://tanstack.com/router/latest) and React Start ⚛️
  - [tRPC](https://trpc.io/) endpoints mounted via router server handlers
  - Vite ⚡️
  - shadcn/ui design system 🧩
  - TypeScript 🦕

- **Data & Auth:**  
  - Node.js (Bun for package management) 🍞
  - [Prisma ORM](https://www.prisma.io/) with **PostgreSQL** 🐘
  - Auth via [better-auth](https://github.com/your-org/better-auth) + Prisma adapter 🔐
  - Optional Redis for caching 🧰

- **Monorepo Tooling:**  
  - [Turborepo](https://turbo.build/) for monorepo management 🏎️
  - Biome for formatting and linting 🌳

---

## 🏗️ Project Structure

```
Netko/
  apps/
    claw/                 # Web app (React + TanStack Router + React Start + tRPC)
                           # Exposes server handlers for /api/trpc and /api/auth
  packages/
    claw/
      domain/             # Domain-driven design: entities, factories, values
      repository/         # Prisma schema, migrations, DB access, caching
      service/            # Business logic, auth config, utilities
    shared/
      ui/                 # Reusable UI components (chat UIs, shadcn/ui wrappers)
      logger/             # Shared logger package
      typescript-config/  # TS config presets
    configs/
      claw-config/        # Runtime env config loader and types
  turbo/                  # Turborepo generators and templates
```

- **apps/claw:**  
  The main web app with SSR and API routes. Hosts tRPC at `/api/trpc` and Better Auth at `/api/auth` via TanStack Router server handlers. 🖥️🚪
- **packages/claw/domain:**  
  Domain logic: entities, value objects, and factories. The DNA of your chat world. 🧬
- **packages/claw/repository:**  
  Prisma schema, migrations, and database adapters (PostgreSQL), plus optional Redis caching. Where your data finds a home. 🏡
- **packages/claw/service:**  
  Business logic, authentication config (`auth`), and supporting utilities. The secret sauce. 🥫
- **packages/shared/ui:**  
  Design system and chat UI components (shadcn/ui, chat, markdown, audio, etc). The wardrobe and props for your chat stage. 🎭
- **packages/shared/logger:**  
  Shared logger utilities and adapters.
- **packages/configs/claw-config:**  
  Environment configuration loader and types used across packages.

---

## 🕹️ Getting Started

Ready to fire up your own lab? 🧑‍🔬

1. **Install dependencies:**  
   ```sh
   bun install
   ```

2. **Configure environment:**  
   - Copy `apps/claw/sample.env` to `apps/claw/.env` and fill in values. 📝
   - Required (typical local): `BASE_URL`, `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`
   - Optional: `DEV_MODE`, `CACHE_URL` (Redis), `SENTRY_DSN`, OAuth client IDs/secrets

3. **Start databases (optional via Docker):**  
   ```sh
   docker compose up -d
   ```
   This brings up PostgreSQL (5432) and Redis (6379) using `compose.yml`.

4. **Start the dev environment:**  
   ```sh
   turbo run dev
   ```
   The app will generate Prisma client, run migrations, and seed dev data automatically.

5. **Open [http://localhost:3000](http://localhost:3000) and start chatting!** 🎉

Advanced (manual DB ops):
```sh
# From repo root
bun run --cwd packages/claw/repository db:generate
bun run --env-file=./apps/claw/.env --cwd packages/claw/repository db:migrate   # dev
bun run --env-file=./apps/claw/.env --cwd packages/claw/repository db:deploy    # deploy
bun run --env-file=./apps/claw/.env --cwd packages/claw/repository db:seed
```

---

## 🏡 Self-Hosting (WIP)

Dreaming of running Netko from your own secret lab? 🏰

Self-hosting support is coming soon! 🛠️  
Stay tuned for updates on how to deploy Netko on your own infrastructure. (No microwave time machine required — just a bit of patience as we stabilize the worldline.)

---

## 🧑‍🔬 Contributing

Pull requests and lab memos welcome! 📝
Help us build the ultimate chat playground — your contributions may just shift the worldline. ✨

Whether you're a code sorcerer, a documentation wizard, or just have a wild idea, hop in! The more, the merrier. 🧙‍♂️🤝

---

## ⚠️ Disclaimer

This project is for experimentation and fun.  
May cause time paradoxes, spontaneous inspiration, or the urge to shout mysterious phrases at your computer. 🌀

Proceed at your own risk — and remember, the only constant is change (and maybe a little chaos). Divergence is expected. 🦋

---

## 🧭 License

MIT — because the best worldlines are open source. 📜
