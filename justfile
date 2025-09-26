# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev

dev-with-proxy:
    API_BASE=https://www.peterbe.com npm run dev

build:
    npm run build

start: build
    npm run start

tsc:
    npm run tsc

lint:
    npm run lint
    npm run typecheck

lintfix:
    npm run lint:fix

test:
    npm run test
    npx playwright test

playwright-codegen:
    npx playwright codegen

format: lintfix

install:
    npm install

upgrade:
    npx npm-check-updates --interactive

start-mock-peterbecom-backend:
    npm run mock-peterbecom-backend
