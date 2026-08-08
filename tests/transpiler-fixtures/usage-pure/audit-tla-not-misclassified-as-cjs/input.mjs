// top-level `await` is ESM-only syntax (parser would reject it in script context).
// Without recognizing top-level await as an ESM marker, `module.exports = ...` further
// down would flip the import style to `require`, producing mixed `require()` + TLA which
// crashes at runtime (CJS modules can't have TLA). Top-level await is treated as a strong
// ESM marker so the import style stays ESM
await Promise.resolve(1);
module.exports = { x: 'test'.at(-1) };
