import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// One comma-sequence descent serves every consumer that reaches a value through a sequence tail, so
// this locks that descent where it is observable: an extends target, a member chain root, a computed
// key, a per-branch fallback, a parameter default and an IIFE callee - each on its own line with its
// own method, so no site masks another. Every prefix call must survive in the output: the descent
// classifies through the tail, it never discards what runs before it.
export class Sub extends (a(), _globalThis).Array {}
export const chained = (b(), _Array$of)(1, 2);
const made = _Array$from;
const {
  [(c(), 'from')]: _unused
} = Array;
export const viaKey = made([3]);
export function branch(cond) {
  const flat = _flatMaybeArray(cond ? (d(), Array.prototype) : _Iterator.prototype);
  return flat;
}
export function defaulted({
  at
} = (e(), Array.prototype)) {
  return at;
}
export const viaIife = _Promise$allSettled([]);