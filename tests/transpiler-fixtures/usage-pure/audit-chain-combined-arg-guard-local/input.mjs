// a guarded dispatch inside the combined chain's ARGUMENTS keeps its guard local: hoisting
// it into the chain test would evaluate the callback's receiver outside the callback and
// short-circuit the whole chain on an unrelated nullish
export function mapped(arr, inner) {
  return arr.flat?.().map(x => inner?.at(0)).length;
}
export function argument(arr, inner) {
  return arr.flat?.().at(inner?.at(0));
}
// the same locality one hop deeper: a guard inside an intermediate HOP's callback
export function hopCallback(arr, inner) {
  return arr.flat?.().map(x => inner?.at(0)).filter?.(Boolean).length;
}
// a guarded dispatch inside a COMPUTED KEY of the receiver composes under the hoisted root
// guard without leaking out of the key position
export function computedKey(o, inner) {
  return o?.rows[inner?.at(0)].flat?.().length;
}
