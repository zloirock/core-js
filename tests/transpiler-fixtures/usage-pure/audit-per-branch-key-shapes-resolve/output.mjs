import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Set from "@core-js/pure/actual/set/constructor";
// the per-branch synth probes the receiver with the key's resolved NAME. that name has to come from
// the shared resolver: a string or numeric key carries it somewhere other than the node's `name`
// slot, and reading that slot raw probes with `undefined` - the branch then looks polyfill-free and
// the raw global survives, unpolyfilled, on a receiver whose type is perfectly well known
const cond = Math.random() > 0.5;
const {
  'from': f
} = cond ? {
  'from': _Array$from
} : _Set;
const {
  of
} = cond ? {
  of: _Array$of
} : _Set;
const {
  0: zero,
  'entries': e
} = cond ? {
  "0": Object["0"],
  'entries': _Object$entries
} : _Map;
const {
  ['ke' + 'ys']: k
} = cond ? {
  ['ke' + 'ys']: _Object$keys
} : _Map;
const {
  [`val${'ues'}`]: v
} = cond ? {
  [`val${'ues'}`]: _Object$values
} : _Map;
export { f, of, zero, e, k, v };