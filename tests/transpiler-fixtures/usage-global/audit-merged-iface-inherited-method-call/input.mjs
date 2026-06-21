// a method-typed slot added via interface declaration-merge, inherited through `extends`,
// must resolve its return type so `.includes(0)` on the result emits es.array.includes.
// `includes` (not `at`) isolates a distinct polyfill entry from the property-slot twin.
class Parent {}
interface Parent { method(): number[] }
class Child extends Parent {}
declare const c: Child;
c.method().includes(0);
