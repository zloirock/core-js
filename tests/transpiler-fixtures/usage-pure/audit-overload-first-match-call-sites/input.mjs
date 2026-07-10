// every overload call-return site arg-discriminates instead of picking the first / last
// arm: object-type call signatures, an aliased `typeof fn` call, an overloaded ambient
// callee under a member chain, and an overloaded interface method under a member chain
interface Make {
  (x: number): number[];
  (x: string): string;
}
declare const make: Make;
export const viaCallSignature = make(5).at(0);

declare function fn(x: number): number[];
declare function fn(x: string): string;
declare const aliased: typeof fn;
export const viaTypeofCall = aliased(0).includes(1);

declare function pick(x: string): { m: number[]; };
declare function pick(x: number): { m: string; };
export const viaAmbientChain = pick(0).m.at(0);

interface Wrap {
  m(x: string): { v: number[]; };
  m(x: number): { v: string; };
}
declare const w: Wrap;
export const viaMemberChain = w.m(0).v.includes('a');
