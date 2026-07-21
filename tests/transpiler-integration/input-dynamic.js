// dynamic-import leg: the chunk-loader wrapper machinery must leave a working `import()`,
// and polyfills must reach the lazily-imported module too
export const results = {
  lazy: import('./lazy-chunk.js').then(mod => mod.value),
  control: [1, 2, 3, 4].filterReject(x => x % 2),
};
