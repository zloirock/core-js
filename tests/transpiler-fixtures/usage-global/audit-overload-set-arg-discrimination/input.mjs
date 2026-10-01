// an overload set is chosen by the arguments wherever it is declared: a namespace MERGED onto a
// class answers a static call like any other set instead of handing back its first declaration,
// and a written callable slot stands the whole set down - the replacement's value is described by
// no arm of it. the last row is the control: the same merged set with the other argument family
// selects the other arm. distinct method per line so each row is attributable
class Host {}
declare namespace Host {
  function make(a: string): string;
  function make(a: number): number[];
}
export const a = Host.make(1).at(0);
class Written {
  static pick(a: string): string;
  static pick(a: number): number[];
  static pick(a: any): any {
    return a;
  }
}
Written.pick = () => "patched";
export const b = Written.pick(1).includes(1);
export const c = Host.make("x").padStart(2);
