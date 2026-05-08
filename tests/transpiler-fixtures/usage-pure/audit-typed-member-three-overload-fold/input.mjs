// `Reg.get` has three overloads (string, string, string[]); divergent return constructors cannot fold.
// Resolution must pick the first overload deterministically so the receiver narrows to string.
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
reg.get('a').at(0);
reg.get('b').includes('z');
reg.get('c').findLast(x => x);
