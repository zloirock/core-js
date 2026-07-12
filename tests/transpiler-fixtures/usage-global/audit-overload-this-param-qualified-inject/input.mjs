// usage-global twin: this-param overloads and qualified `typeof NS.fn` arg-discriminate to
// the precise family; a rest-armed divergent set injects both families (widen)
declare function g(this: Window, x: string): number[];
declare function g(x: number): string;
export const viaThisParam = g('a').at(0);

declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = f(5).findLast(v => v > 0);

declare function ra(...xs: string[]): number[];
declare function ra(x: number): string;
export const viaRestWiden = ra(5).includes(1);
