// `export { _ref as foo }` - user already binds `_ref`. The fresh-name allocator for
// memoized receivers must avoid colliding with the existing user binding, otherwise
// the export silently shadows the polyfill's local. Allocator falls through to `_ref2`
// because export specifier locals are included in the collected binding names
const _ref = [1, 2, 3];
export { _ref as foo };
const x = [4, 5];
const y = x.flat();
const z = ['a', 'b'].at(0);
console.log(y, z);
