// Vue SFC virtual id with `lang=cts` exercises the `[cm]?` branch of the SFC lang-suffix
// lift. unplugin's `liftSfcLangSuffix` synthesises a `.cts` extension hint so oxc enables
// the CommonJS + TypeScript dialect for the script block AND emit uses `require(...)`
// shape (correct for `.cts`). babel-plugin doesn't see SFC virtual ids in real bundler
// pipelines: webpack's babel-loader passes only `loaderContext.resourcePath` (no query)
// to babel; Vite uses unplugin (not babel-plugin). babel-plugin therefore falls back to
// source-marker detection (no top-level ESM/CJS markers here -> default `import`).
// divergence is by design: unplugin emit is `require()`, babel emit is `import`.
// `as` cast must be accepted in both cases; polyfill emit fires for instance methods
// and a static. Each line uses a distinct dispatch shape
const x = 1 as number;
arr.at(0);
str.replaceAll('a', 'b');
Array.from(it);
