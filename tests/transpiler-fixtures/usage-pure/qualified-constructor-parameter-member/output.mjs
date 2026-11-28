import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class Base {
  constructor(p: number[]) {}
}
namespace NS2 {
  export class Cls extends Base {}
}
type P2 = ConstructorParameters<typeof NS2.Cls>[0];
declare const p2: P2;
_atMaybeArray(p2).call(p2, 0);