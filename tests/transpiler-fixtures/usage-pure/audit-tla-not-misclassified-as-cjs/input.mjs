// top-level `await` is ESM-only syntax (parser would reject in script context).
// without recognizing TLA as an ESM marker, `module.exports = ...` further down would
// flip importStyle to `require`, producing mixed `require()` + TLA which crashes at runtime
// (CJS modules can't have TLA). detectCommonJS now treats top-level AwaitExpression as
// strong ESM marker so importStyle stays `import`
await Promise.resolve(1);
module.exports = { x: 'test'.at(-1) };
