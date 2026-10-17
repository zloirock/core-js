import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
let A4;
function assign() {
  ({
    Array: A4
  } = _globalThis);
}
export const viaSeNestedFn = (A4 === Array ? _Array$from : A4.from.bind(A4))([7]);