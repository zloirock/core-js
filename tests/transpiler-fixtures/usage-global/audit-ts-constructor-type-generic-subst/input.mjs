type Factory<T> = new () => T;
function make(): Factory<string> {
  return String;
}
make().name;
make().at(-1);
