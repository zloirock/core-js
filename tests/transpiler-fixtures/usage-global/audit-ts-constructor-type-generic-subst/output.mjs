import "core-js/modules/es.function.name";
// TS generic constructor type with a substitution: type-only references in the type
// position must not produce runtime polyfill emission.
type Factory<T> = new () => T;
function make(): Factory<string> {
  // @ts-expect-error a return the annotation does not admit is the shape under test
  return String;
}
make().name;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
make().at(-1);