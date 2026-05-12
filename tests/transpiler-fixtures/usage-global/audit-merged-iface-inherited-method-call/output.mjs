import "core-js/modules/es.array.includes";
// Same chain as the property fixture, but through a method-typed iface slot - exercises
// the call-site `resolveClassMember` walk-up branch independently of `findTypeMember`.
// Using `includes` instead of `at` ensures the test isolates a distinct polyfill entry.
class Parent {}
interface Parent {
  method(): number[];
}
class Child extends Parent {}
declare const c: Child;
c.method().includes(0);