import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A statement-scope destructure keeps the receiver call once before its nested static binds.
// The remaining properties are copied afterward, excluding the consumed outer Array key.
declare const logCall: () => any;
const {} = (logCall(), _globalThis),
  {
    Array: {},
    ...rest
  } = _globalThis,
  from = _Array$from;
console.log(from, rest);