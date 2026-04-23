// `class C` + sibling `interface C extends Parent { ... }` - TS declaration merging: instance
// members from the interface (and its extends chain) are reachable on C. property-access
// path (`c.items`, non-call) goes through `getTypeMembers`'s class-like branch, which now
// includes sibling interfaces + their extends chain with subst
interface Parent { items: number[] }
class C {}
interface C extends Parent {}
declare const c: C;
c.items.at(0);
