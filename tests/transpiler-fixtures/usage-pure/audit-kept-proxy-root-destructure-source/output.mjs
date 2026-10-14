import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// a kept store over an effect-keyed proxy chain as a destructure SOURCE: the extraction claims the
// pattern and renders the source as written, so the hop collapse still runs on it - the dropped
// `self` hop's key folds into the next key, which runs once. the assignment form takes the same
// rule, and a nested level beside the claim reads the same collapsed source once.
let c4 = 0;
let ds;
export const copyWithinKept = _copyWithinMaybeArray((ds = _globalThis.window)?.[c4++, "Array"].prototype ?? {});
let mapOfKept;
let asg;
mapOfKept = _mapMaybeArray((asg = _globalThis.window)?.[c4++, "Array"].prototype ?? {});
let nst;
const _ref = (nst = _globalThis.window)?.[c4++, "Array"].prototype ?? {},
  flatNested = _flatMaybeArray(_ref),
  {
    constructor: {
      length: ctorLength
    } = {}
  } = _ref;
export { flatNested, ctorLength };
export { c4, mapOfKept };