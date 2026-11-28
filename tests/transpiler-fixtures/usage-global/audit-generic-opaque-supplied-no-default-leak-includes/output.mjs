import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Date has no includes method. An opaque argument still needs the generic at helper.
function fromUnionParam<T = string>(x: T | null): T {
  return x as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
fromUnionParam(new Date()).includes(1);
export function last(value: any) {
  return fromUnionParam(value).at(-1);
}