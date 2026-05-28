// flatten + Symbol.iterator sibling + `...rest`: rest must EXCLUDE both consumed keys
// from the residual object. requires emitting two sentinels in the residual destructure:
//   - `Array: _unused` (regular static-method consumed key)
//   - `[_Symbol$iterator]: _unused2` (synth Symbol.iterator consumed key) - uses the
//     polyfilled Symbol.iterator binding so engines without native `Symbol` can still
//     evaluate the computed key. residual init `= obj` matches babel byte-for-byte
//     (aliased Identifier tail keeps the user's `obj` binding intact)
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter, ...rest } = obj;
console.log(from, iter, rest);
