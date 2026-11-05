// Files and strip dependencies that can change a cached evaluation without changing its code.
export const CACHE_MACHINERY = [
  '../helpers/restore-property.cjs',
  '../e2e-usage-pure/unbacked-window-host.cjs',
  'cache-store.mjs',
  'global-leg.mjs',
  'global-leg-worker.mjs',
  'harness.mjs',
  'rig-aliases.mjs',
  'realm-runner.mjs',
  'serialize.mjs',
  'shard.mjs',
  'strip-builtins.mjs',
  'strip-manifest.mjs',
  'stripped-worker.mjs',
];
// These transforms prepare runtime source, independently of the emitters under test.
export const STRIP_DEPS = [
  '@babel/core', '@babel/plugin-transform-typescript', '@babel/plugin-proposal-decorators',
  '@babel/plugin-transform-class-properties', '@babel/plugin-transform-class-static-block',
];
