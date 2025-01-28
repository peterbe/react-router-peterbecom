# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev

build:
    npm run build

build-fast:
    npm run build:remix

start: build
    npm run start

start-fast: build-fast
    npm run start

tsc:
    npm run tsc

lint:
    npm run lint
    npm run typecheck

lintfix:
    npm run lint:fix

test:
    # If this fails, did you run `VITE_API_BASE=https://www.peterbe.com npm run build` ?
    npm run test
    npx playwright test


format: lintfix

install:
    npm install
