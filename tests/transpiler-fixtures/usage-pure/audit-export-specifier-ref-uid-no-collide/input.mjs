// `export { _ref as foo }` - user already binds `_ref`. plugin's UID generator must NOT
// re-allocate `_ref` for memoized-receiver slots, otherwise the export silently shadows
// the polyfill's local. allocator falls through to `_ref2` because `collectAllBindingNames`
// now picks up `ExportSpecifier.local`
const _ref = [1, 2, 3];
export { _ref as foo };
const x = [4, 5];
const y = x.flat();
const z = ['a', 'b'].at(0);
console.log(y, z);
