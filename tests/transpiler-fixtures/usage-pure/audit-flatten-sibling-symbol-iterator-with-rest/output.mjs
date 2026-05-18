import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// flatten + Symbol.iterator sibling + `...rest`: rest must EXCLUDE both consumed keys
// from the residual object. requires emitting two sentinels in preservedOuter:
//   - `Array: _unused` (regular static-method consumed key)
//   - `[_Symbol$iterator]: _unused2` (synth Symbol.iterator consumed key) - uses the
//     polyfilled Symbol.iterator binding so old runtimes without native `Symbol` can
//     still evaluate the computed key. `emitRestSentinel` returns the right shape based
//     on `outer.extractions[0].synth` discriminator. residual init `= obj` matches babel
//     byte-for-byte (aliased Identifier tail keeps user binding via `preservedInitSrc`)
const obj = _globalThis;
const from = _Array$from;
const iter = _getIteratorMethod(obj);
const {
  Array: _unused,
  [_Symbol$iterator]: _unused2,
  ...rest
} = obj;
console.log(from, iter, rest);