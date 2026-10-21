import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// Instance destructuring keeps effectful realm receivers, stores and native fallback selection.
let c4 = 0;
let ds;
export const copyWithinKept = _copyWithinMaybeArray((ds = _globalThis.window)?.[c4++, 'self'].Array.prototype ?? {});
let mapOfKept;
let asg;
mapOfKept = _mapMaybeArray((asg = _globalThis.window)?.[c4++, 'self'].Array.prototype ?? {});
let nst;
const _ref = (nst = _globalThis.window)?.[c4++, 'self'].Array.prototype ?? {},
  flatNested = _flatMaybeArray(_ref),
  {
    constructor: {
      length: ctorLength
    } = {}
  } = _ref;
export { flatNested, ctorLength };
export { c4, mapOfKept };