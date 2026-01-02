# https://github.com/casey/just
# https://just.systems/

dev:
    bun run dev

dev-with-proxy:
    API_BASE=https://www.peterbe.com bun run dev

start-with-proxy: build
    API_BASE=https://www.peterbe.com bun run start

build:
    bun run build

start: build
    bun run start

tsc:
    bun run tsc

lint:
    bun run lint
    bun run typecheck

lintfix:
    bun run lint:fix

test:
    bun run test
    bunx playwright test

playwright-codegen:
    bunx playwright codegen

format: lintfix

install:
    bun install

outdated:
    bun outdated

upgrade:
    bun update --interactive
    bun install

start-mock-peterbecom-backend:
    bun run mock-peterbecom-backend
