import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
// the assignment-form arm registers statics-only hints the same way; a MULTI-NAME anchor
// write registers each bound name independently (per-name entries, no clobber)
let AS1;
({
  Object: AS1
} = _globalThis);
export const viaAssignStatics = _Object$entries(pairsSrc);