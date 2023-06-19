## Reproduce repo for swr package module import error

## Run

```bash
// install modules
yarn install

// try to build pack
yarn build

```

at build step TS should throw error:

```bash
src/main.ts:3:2 - error TS2305: Module '"stale-while-revalidate-cache"' has no exported member 'EmitterEvents'.

3  EmitterEvents,
   ~~~~~~~~~~~~~
```

