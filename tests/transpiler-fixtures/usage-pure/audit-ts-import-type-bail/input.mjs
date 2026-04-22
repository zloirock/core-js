// `import('./x').Foo` type-reference can't be resolved without reading the target module
// (the plugin doesn't do file I/O). the resolver returns null, identifier visitor falls
// back to the generic polyfill variant - no regression, just no type-driven narrowing
declare const x: import('./remote').RemoteArray;
const first = x.at(0);
export { first };
