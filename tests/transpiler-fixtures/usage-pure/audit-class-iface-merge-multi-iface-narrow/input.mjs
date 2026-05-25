// declaration-merging chain across MULTIPLE sibling interfaces: `findTypeMember` must
// `break` past EACH unannotated property until one of the typed merge-siblings supplies
// the annotation. validates the break-not-return behavior across a multi-step iface
// chain, not just a single property/iface pair
class C {
  items = [];
}
interface C {
  items;
}
interface C {
  items: number[];
}
declare const c: C;
c.items.at(-1);
[c];
