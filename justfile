# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev

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

format: lintfix

install:
    npm install

upgrade:
    npx npm-check-updates --interactive

start-mock-peterbecom-backend:
    npm run mock-peterbecom-backend
