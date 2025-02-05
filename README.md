# chatapp

A simple chat application -- supports direct messaging and group chat.

# Tech Stack

- NextJS as frontend framework
- Websocket for persistent dual tcp connection ([npm package](https://www.npmjs.com/package/ws)).
- Express as backend framework (mostly redundant)
- Redis (Pub-Sub and Queue)
- Prisma (ORM)
- NextAuth (Authentication and Authorization)
- Zod (Data parsing and typing)
- ShadCN UI (UI components)

---

## Getting Started

Follow these steps to set up and run the application locally:

# Step 0: Setup project locally

```bash
git clone https://github.com/LaPulgaaa/chatapp.git
```

# Step 1: Navigate to project && install dependencies

```bash
cd chatapp
npm install
```

# Step 2: Populate `.env` -- Setup Github OAuth application to obtain related secret.

Note: .env.example has a template.

```
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost/postgres"
ACCESS_TOKEN_SECRET= //any cryptographically random string
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET= //any cryptographically random string
NEXTAUTH_URL=http://localhost:3000
```

# Step 3: Run docker locally to setup database

```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword postgres
```

# Step 4: Run Prisma migrations

```bash
npm run prisma:migrate
```

OR

```bash
npx prisma migrate --schema=./packages/prisma/schema.prisma
```

# Step 5: Generate Prisma client

Either

```bash
npm run prisma:generate
```

OR

```bash
npx prisma generate --schema=./packages/prisma/schema.prisma
```

# Step 6: Start the express server

```
npm run server
```

# Step 7: Run NextJS project

```
npm run dev
```
