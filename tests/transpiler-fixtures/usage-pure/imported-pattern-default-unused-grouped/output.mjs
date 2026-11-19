// An imported level default already owns these retained reads.
// Reprocessing without a neighbouring extraction keeps the pattern and its rest intact.
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
export { grouped };