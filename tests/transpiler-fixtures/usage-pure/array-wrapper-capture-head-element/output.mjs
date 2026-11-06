import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// a retained capture of an array wrapper over a loop-head binding declares every captured slot:
// the key-effect claim beside a plain static resolves through the capture it was moved onto
const log = [];
const out = [];
for (const e of [Array]) {
  const [{}] = [e];
  const of = (_pushMaybeArray(log).call(log, 'k'), _Array$of);
  const from = _Array$from;
  _pushMaybeArray(out).call(out, of, from);
}
export { out, log };