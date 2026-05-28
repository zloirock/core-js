import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `[Symbol.iterator]: {next}` - value is a nested ObjectPattern, NOT a binding Identifier.
// the synth-extraction path (which would emit `next = _getIteratorMethod(receiver)`) bails
// because the value isn't a single binding, but the computed key still needs to substitute
// `[Symbol.iterator]` -> `[_Symbol$iterator]` so the destructure survives on engines without
// native `Symbol.iterator`. preserved-init src keeps user binding `obj` for the aliased
// proxy-global (alias decl's own `= globalThis` init is polyfilled independently)
const obj = _globalThis;
const from = _Array$from;
const {
  [_Symbol$iterator]: {
    next
  }
} = obj;
console.log(from, next);