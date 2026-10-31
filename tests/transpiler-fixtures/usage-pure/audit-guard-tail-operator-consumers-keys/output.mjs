import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
export const keys = [];
for (const key in null == _globalThis.window ? void 0 : _Object$fromEntries([['a', 1]])) _pushMaybeArray(keys).call(keys, key);