// dynamic-import leg: the chunk-loader wrapper machinery must leave a working `import()`,
// and polyfills must reach the lazily-imported module too
export const results = {
  lazy: import('./lazy-chunk.js').then(mod => mod.marker === 'core-js dynamic fixture' ? mod.value : -1),
  control: 2.0.clamp(4, 6),
};
