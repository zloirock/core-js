import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
declare const logCall: () => any;
for (const from = _Array$from, {
    Array: _unused,
    ...rest
  } = (logCall(), _globalThis); false;) {
  console.log(from, rest);
}