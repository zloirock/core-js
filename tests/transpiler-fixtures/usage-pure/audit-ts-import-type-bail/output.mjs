import _at from "@core-js/pure/actual/instance/at";
// `import('./x').Foo` type-reference can't be resolved without reading the target module
// (the plugin doesn't do file I/O). the resolver returns null, identifier visitor falls
// back to the generic polyfill variant - no regression, just no type-driven narrowing
declare const x: import('./remote').RemoteArray;
const first = _at(x).call(x, 0);
export { first };