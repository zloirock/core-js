import _Array$from from "@core-js/pure/actual/array/from";
class Reader {
  static read(source) {
    return (source === Array ? _Array$from : source.from.bind(source))([1])[0];
  }
}
const instance = new Reader();
export function read(key) {
  const custom = {
    value: 9,
    from() {
      return [this.value];
    }
  };
  return [Reader.read(Array), instance[key].read(custom)];
}
export const result = read("constructor");