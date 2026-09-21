import _Promise from "@core-js/pure/actual/promise";
// The constructor default uses its index; supplied objects keep their own properties.
export function read({
  all,
  ...rest
} = _Promise) {
  return [all, rest];
}
read();
read({
  all: custom,
  extra: 7
});