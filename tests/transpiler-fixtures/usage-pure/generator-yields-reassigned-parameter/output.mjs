import _at from "@core-js/pure/actual/instance/at";
class Box {
  *values<T>(x: T, update = x = JSON.parse('[37]')) {
    yield x;
  }
}
export function read() {
  for (const value of new Box().values('ab')) return _at(value).call(value, 0);
}