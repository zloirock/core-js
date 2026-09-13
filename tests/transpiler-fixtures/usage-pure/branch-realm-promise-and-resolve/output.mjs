import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Two guaranteed realm operands preserve the selected Promise static surface.
// The resolve call needs its static entry, including when native Promise is absent.
export const result = _Promise$resolve(1);