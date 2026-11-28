import _at from "@core-js/pure/actual/instance/at";
// Date has no includes method. An opaque argument still needs the generic at helper.
function fromUnionParam<T = string>(x: T | null): T {
  return x as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
fromUnionParam(new Date()).includes(1);
export function last(value: any) {
  var _ref;
  return _at(_ref = fromUnionParam(value)).call(_ref, -1);
}