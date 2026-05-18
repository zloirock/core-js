// flatten + Symbol.iterator sibling + `...rest`: rest must EXCLUDE both consumed keys
// from the residual object. requires emitting two sentinels in preservedOuter:
//   - `Array: _unused` (regular static-method consumed key)
//   - `[_Symbol$iterator]: _unused2` (synth Symbol.iterator consumed key) - uses the
//     polyfilled Symbol.iterator binding so old runtimes without native `Symbol` can
//     still evaluate the computed key. `emitRestSentinel` returns the right shape based
//     on `outer.extractions[0].synth` discriminator. residual init `= obj` matches babel
//     byte-for-byte (aliased Identifier tail keeps user binding via `preservedInitSrc`)
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter, ...rest } = obj;
console.log(from, iter, rest);
