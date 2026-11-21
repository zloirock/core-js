class Reader {
  static read(source) { return source.from([1])[0]; }
}
const instance = new Reader();
export function read(key) {
  const custom = { value: 9, from() { return [this.value]; } };
  return [Reader.read(Array), instance[key].read(custom)];
}
export const result = read("constructor");
