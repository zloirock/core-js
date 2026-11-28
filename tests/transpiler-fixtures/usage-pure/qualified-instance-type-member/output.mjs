import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
namespace NS4 {
  export class Cls extends Array<number> {}
}
type I4 = InstanceType<typeof NS4.Cls>;
declare const i4: I4;
_includesMaybeArray(i4).call(i4, 1);