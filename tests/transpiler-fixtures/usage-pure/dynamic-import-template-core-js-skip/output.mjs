import _Array$from from "@core-js/pure/actual/array/from";
// dynamic `import('core-js/...')` with template-literal source is preserved verbatim
// (entry-rewrite only matches static `import 'core-js'` / `core-js/*`). The unrelated
// `Array.from` runtime call still resolves to its static-method polyfill.
async function load(mod) {
  const lib = await import(`core-js/${mod}`);
  return _Array$from(lib);
}