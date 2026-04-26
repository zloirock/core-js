// TS generic constructor type with a substitution: type-only references in the type
// position must not produce runtime polyfill emission.
type Factory<T> = new () => T;
function make(): Factory<string> {
  return String;
}
make().name;
make().at(-1);
