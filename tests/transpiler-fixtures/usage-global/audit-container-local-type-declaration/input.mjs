// a namespace body is a lexical container on both parsers but a scope level on only one, and a
// switch hosts its declarations under `cases` - either gap leaves the declaration unreachable or
// answers with an outer namesake. the last two lines are the negatives: a declaration written
// OUTSIDE keeps its own meaning when the value is read inside a namespace
interface Outer { items: string; }
declare const outside: Outer;
declare const k: number;
export let cased: number | undefined;
namespace NS {
  interface Inner { items: number[]; }
  declare function make(): Inner;
  export function readParam(v: Inner) { return v.items.at(0); }
  export const fromAmbient = make().items.includes(1);
  export const outer = outside.items.at(0);
}
switch (k) {
  case 1:
    interface Cased { items: number[]; }
    declare const local: Cased;
    cased = local.items.flat().length;
}
export const r = [NS.readParam({ items: [1] }), NS.fromAmbient, NS.outer, cased];
