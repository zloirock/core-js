import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
const out = [];
const W = {
  w: Array
};
for (const {
  w: {
    from
  }
} of [W]) _pushMaybeArray(out).call(out, typeof from);
export { out };