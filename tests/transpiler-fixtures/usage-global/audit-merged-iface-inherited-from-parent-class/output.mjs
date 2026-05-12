import "core-js/modules/es.array.at";
// TS declaration merging puts `interface Parent { items: number[] }` into Parent's
// type surface; via `extends` it surfaces on Child too. Plugin must narrow `.at(0)` to
// the array variant - generic fallback would also pull in the string polyfill.
class Parent {}
interface Parent {
  items: number[];
}
class Child extends Parent {}
declare const c: Child;
c.items.at(0);