import _atMaybeString from "@core-js/pure/actual/string/instance/at";
class C<T> {
  *g<T>(x: T): Generator<T> {
    yield x;
  }
}
for (const x of new C<number[]>().g("abc")) _atMaybeString(x).call(x, 0);
export {};