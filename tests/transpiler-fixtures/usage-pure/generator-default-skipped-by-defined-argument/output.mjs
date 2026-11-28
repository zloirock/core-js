import _atMaybeString from "@core-js/pure/actual/string/instance/at";
class Box {
  *values<T>(x: T, update = x = JSON.parse('[37]')) {
    yield x;
  }
}
export function read() {
  for (const value of new Box().values('ab', 'keep')) return _atMaybeString(value).call(value, 0);
}