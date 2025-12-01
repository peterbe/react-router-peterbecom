# react-router-peterbecom

The front-end for <https://www.peterbe.com> which is my personal blog.

The technology used is React Router 7 (previously Remix).

## Hacking

```bash
npm run dev
```

and visit <http://localhost:3000>.
By default, it'll fetch JSON data from <http://localhost:8000>
but you can set `API_BASE`

```bash
export API_BASE=https://www.peterbe.com
```

### Testing

```bash
npm run test
```

### Linting

All linting and code formatting is done using [Biome](https://biomejs.dev/).

..
