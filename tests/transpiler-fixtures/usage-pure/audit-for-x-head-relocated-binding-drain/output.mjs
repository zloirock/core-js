import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const seen = [];
// for-await reaches the head through its own statement type
async function drain(source) {
  for await (const {
    at,
    ...rest
  } of source) {
    (_pushMaybeArray(seen) || 0).call(seen, typeof at, 'at' in rest, rest.extra);
  }
}
export { seen };
export { drain };