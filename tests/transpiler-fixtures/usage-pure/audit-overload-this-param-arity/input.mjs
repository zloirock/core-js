// a leading `this` pseudo-param fills an AST param slot but no runtime arg slot: overload
// arity and per-slot pairing must align with the CALL args, so a this-annotated overload
// arg-matches like its unannotated twin instead of being skipped or mismatched
declare function g(this: Window, x: string): number[];
declare function g(x: number): string;
export const viaFunction = g('a').at(0);

// a this-param-ONLY overload takes zero call args - TS routes a one-arg call to the next arm
declare function k(this: Window): number[];
declare function k(x: string): string;
export const viaZeroArg = k('a').includes('b');

// bodyless declare-class methods pair the same way
declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}
declare const c: C;
export const viaDeclareClass = c.m('a').at(1);

// interface method signatures too
interface I {
  pick(this: I, x: string): number[];
  pick(x: number): string;
}
declare const i: I;
export const viaInterface = i.pick('a').includes(1);

// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
export const viaCallSignature = f('a').at(2);
