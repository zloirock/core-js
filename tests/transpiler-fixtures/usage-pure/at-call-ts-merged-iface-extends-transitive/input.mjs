// transitive merged-interface extends: `interface C extends B`, `interface B extends A`.
// getTypeMembers walks A -> B -> (class C's body) -> interface C body. appendInterfaceExtendsMembers
// recurses into parents so the chain reaches A's `items` without collapsing at B
interface A { items: number[] }
interface B extends A {}
class C {}
interface C extends B {}
declare const c: C;
c.items.at(0);
