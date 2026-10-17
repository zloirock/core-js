import _Promise from "@core-js/pure/actual/promise";
const settled = {
  C: _Promise
};
const named = settled;
const either = opener || named;
either.C = userValue;
export const all = named.C.allSettled([]);