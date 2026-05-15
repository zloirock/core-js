// multiple merged namespace declarations on one class - each block exports a
// different fn. resolver must walk past namespace #1 when looking up `create`
// (only in namespace #2). without the multi-namespace walk, `create` lookup would
// bail on namespace #1's body and `.at(0)` would fall to common (over-injecting
// array.at + string.at). both fns return the user class -> no polyfills emitted
class MyContainer<T> {}
namespace MyContainer {
  export function build<T>(arr: T[]): MyContainer<T> {
    return new MyContainer<T>();
  }
}
namespace MyContainer {
  export function create<T>(value: T): MyContainer<T> {
    return new MyContainer<T>();
  }
}

MyContainer.build([1, 2, 3]).at(0);
MyContainer.create(42).at(0);
