import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const seen = [];
for (const {
  at,
  ...rest
} in {
  a: 1
}) {
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest);
}
export { seen };