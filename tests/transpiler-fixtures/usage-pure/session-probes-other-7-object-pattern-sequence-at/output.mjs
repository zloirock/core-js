import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const log = [];
const obj = {};
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  const {
    at: m,
    z
  } = (mark(), obj);
  use(m, z);
}