import _getIterator from "@core-js/pure/actual/get-iterator";
// optional member wrapped in inner parens then a TS cast, called non-optionally. the cast
// is peeled so the paren-lookup is still detected: chain ends at the optional access, outer
// call must throw on nullish. emits bare `_getIterator(receiver)` with no nullish guard
declare function getArr(): number[] | null;
_getIterator(getArr());