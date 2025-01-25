# https://github.com/casey/just
# https://just.systems/

dev:
    rm -rf .parcel-cache # to avoid seg faults in parcel
    npm run dev

build:
    rm -rf .parcel-cache # to avoid seg faults in parcel
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
    npm run pretty
    npm run typecheck

lintfix:
    npm run pretty:fix

test:
    npm run test

format: lintfix

install:
    npm install
