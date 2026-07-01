// declare-class method overloads resolve per call-site like interface overloads: a literal arg matches the
// overload whose literal param equals it (`get('a')` -> string, `get('c')` -> string[]); a keyword arg matches
// by primitive kind. an unresolvable arg over a DIVERGENT overload set folds to generic - NOT the last/first
// arm, which would emit a type-specific Maybe that throws on a foreign return. findClassMember's last-wins
// reverse-walk previously picked one arm regardless of the args; babel and unplugin share the provider verdict
declare class Reg {
  get(k: 'a'): string;
  get(k: 'c'): string[];
  lookup(x: string): number[];
  lookup(x: boolean): string;
}
declare const reg: Reg;
reg.get('a').at(0);
reg.get('c').includes(1);
function probe(u) {
  return reg.lookup(u).at(-1);
}
