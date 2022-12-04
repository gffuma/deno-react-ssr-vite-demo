# Deno React SSR Vite Demo 🦕
> Demo PokèDex App Just 4 Fun


An experiment using new `--node-modules-dir` mode for Deno with
[vite](https://vitejs.dev) as a bundler to build an SSR Universal PokeDex
App with React18 and streams.


## Development
```
deno task dev
```
Starts a development server at `http://localhost:4000` with HMR.

## Production
```
deno task build
deno task start
```
Build client for prodution and starts a production server at `http://localhost:5000`.

## License
MIT
