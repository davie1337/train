# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Reset the database (destructive)
npm run db:reset
```

Environment: create a `.env` file with `ANTHROPIC_API_KEY=...`. Without it, the app runs in mock mode (returns static example components instead of calling Claude).

## Architecture

UIGen is a Next.js 15 App Router application. The core flow: user types a prompt → chat message sent to `/api/chat` → Claude streams back text + tool calls that create/edit files → the frontend renders the updated virtual file system in a Monaco editor and live preview.

### Key Concepts

**Virtual File System** (`src/lib/file-system.ts`): All generated files live in memory in a `VirtualFileSystem` instance — nothing is written to disk. The VFS is serialized to JSON and stored in the database (`Project.data`). It is reconstructed from that JSON on each request to `/api/chat`.

**AI Tools** (`src/lib/tools/`): The AI is given two tools during generation:
- `str_replace_editor` — view/create/replace content in VFS files
- `file_manager` — rename/delete/list VFS files

**AI Provider** (`src/lib/provider.ts`): Returns either the real Anthropic Claude model (claude-haiku-4-5) or a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent.

**Chat API** (`src/app/api/chat/route.ts`): Receives `{ messages, files, projectId }`, reconstructs the VFS, streams Claude's response with tool use, and on finish saves the updated messages + VFS back to the database (only if the user is authenticated and `projectId` is provided).

**Authentication** (`src/lib/auth.ts`): JWT stored in an httpOnly cookie. Validated server-side in server actions. Passwords hashed with bcrypt. Projects can be anonymous (`userId` is optional on the `Project` model).

**State / Context**:
- `chat-context.tsx` — owns the message list and sends requests to `/api/chat`
- `file-system-context.tsx` — owns the in-memory VFS state on the client; synced from AI responses

**Layout**: `main-content.tsx` renders a resizable three-panel layout: Chat (left) | File Tree + Code Editor (center) | Preview (right). The preview (`PreviewFrame.tsx`) uses `@babel/standalone` to transpile JSX in the browser and renders `App.jsx` from the VFS.

**Prompts** (`src/lib/prompts/generation.tsx`): The system prompt for component generation. Cached with Anthropic's prompt caching (`cacheControl: { type: "ephemeral" }`).

### Database (Prisma + SQLite)

Schema at `prisma/schema.prisma`. Two models:
- `User` — email + bcrypt password
- `Project` — `messages` (JSON string), `data` (JSON string of serialized VFS), optional `userId`

Generated client is output to `src/generated/prisma/`. After schema changes run `npx prisma migrate dev`.

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Testing

Tests use Vitest + jsdom + React Testing Library. Config at `vitest.config.mts`. Tests live in `__tests__/` subdirectories next to the code they test.
