import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `ConstructorParameters<typeof Bar>[1]` - Bar inherits Foo's constructor through `extends`,
// so resolution must walk the superClass chain to the actual constructor; the `[1]` index picks
// up the second param (`string`), routing `.at(0)` to the String-specific polyfill
class Foo {
  constructor(x: number, y: string) {}
}
class Bar extends Foo {}
declare const second: ConstructorParameters<typeof Bar>[1];
_atMaybeString(second).call(second, 0);