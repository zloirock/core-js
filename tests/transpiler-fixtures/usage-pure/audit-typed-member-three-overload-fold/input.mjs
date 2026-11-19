// `Reg.get` is a LITERAL-discriminated overload set (`get('a'): string; get('b'): string; get('c'): string[]`).
// resolution matches each call's literal arg to the overload whose literal param equals it, so the receiver
// narrows PRECISELY per key - `get('a')`/`get('b')` to string, `get('c')` to string[] - NOT folded or
// first-arm'd (which would mis-narrow `get('c')` to the first overload's string). a method-resolution delta;
// babel and unplugin share the provider verdict, so no sidecar
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
reg.get('a').at(0);
reg.get('b').includes('z');
reg.get('c').findLast(x => x);
