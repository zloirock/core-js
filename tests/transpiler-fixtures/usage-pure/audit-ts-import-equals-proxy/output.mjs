import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the TS require-import twin binds the global like the bare proxy spelling: statics substitute
// (polyfill-always-wins) and a PATCH through the binding routes onto the injected constructor
import gtp = require("@core-js/pure/actual/global-this");
export const viaTsImportEquals = _Iterator$from([2]);
_Map.groupBy = function patched() {
  return 'p';
};
export const patchStillWins = _Map.groupBy([], x => x);