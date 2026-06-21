// declaration-merging chain across MULTIPLE sibling interfaces: member lookup must skip
// past EACH unannotated property until one of the typed merge-siblings supplies the
// annotation. validates break-not-return across a multi-step iface chain, not just a
// single property/iface pair
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
