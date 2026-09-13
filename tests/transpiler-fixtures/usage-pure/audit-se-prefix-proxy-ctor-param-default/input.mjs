// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
function effect() {
  return 0;
}
function withDefault({ allSettled, ...promiseRest } = (effect(), globalThis.Promise)) {
  return allSettled([]);
}
withDefault();
