import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
var _ref;
// a READ target with a claiming read: the write collapses AND the read still resolves the
// static through the stored conditional, typed dispatch included
let k9;
k9 = null == _globalThis.window ? void 0 : _self;
export const viaStoredReadClaim = k9 == null ? void 0 : _atMaybeArray(_ref = _Array$of(3)).call(_ref, 0);

// reads of the stored target claim through the RENDERED conditional in every guard form -
// and, because the render IS the navigation it replaced, in unguarded forms too (a braced
// `if` body, a later function body) exactly like the raw source classifies them
let k13;
k13 = null == _globalThis.window ? void 0 : _self;
export let viaBracedIfRead;
if (k13) {
  viaBracedIfRead = _Array$from('ab');
}
export function viaFunctionBodyRead() {
  return (k13.Object.entries, _Object$entries)({});
}