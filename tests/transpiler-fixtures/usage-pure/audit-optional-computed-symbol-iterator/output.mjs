import _getIterator from "@core-js/pure/actual/get-iterator";
// optional computed access `obj?.[Symbol.iterator]`: the well-known symbol must still
// be recognised as an iteration probe even through optional chaining.
arr == null ? void 0 : _getIterator(arr);