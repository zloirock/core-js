import objectGetOwnPropertyDescriptors from '@core-js/pure/full/object/get-own-property-descriptors';

const obj = { a: 1, b: 'x', c: true };
const objDescs: { a: TypedPropertyDescriptor<number>; b: TypedPropertyDescriptor<string>; c: TypedPropertyDescriptor<boolean> } &
  { [x: string]: PropertyDescriptor } = objectGetOwnPropertyDescriptors(obj);

class Foo {
  bar = 42;
  baz() {}
}
const foo = new Foo();
const fooDescs: { bar: TypedPropertyDescriptor<number>; baz: TypedPropertyDescriptor<() => void> } &
  { [x: string]: PropertyDescriptor } = objectGetOwnPropertyDescriptors(foo);

const descsAny = objectGetOwnPropertyDescriptors({ x: 1, y: 2 });

// @ts-expect-error
objectGetOwnPropertyDescriptors();
