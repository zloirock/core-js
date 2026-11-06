// dynamic `await import('core-js/...')` inside an async function is a runtime call,
// not a static entry-import to be substituted; the plugin leaves it as-is.
async function init() {
  await import('core-js/actual/array/from');
}