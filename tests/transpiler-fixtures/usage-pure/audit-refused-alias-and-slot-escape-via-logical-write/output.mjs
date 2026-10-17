import _Promise from "@core-js/pure/actual/promise";
const cl = {
  q: null
};
cl.q ||= _Promise;
export const viaLogicalWrite = typeof cl.q.try;