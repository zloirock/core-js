import 'core-js/es';
import getOwnPropertyDescriptors from 'core-js/es/object/get-own-property-descriptors';

const obj = { a: 1, b: 'x', c: true };

const objDescsNS: { a: TypedPropertyDescriptor<number>; b: TypedPropertyDescriptor<string>; c: TypedPropertyDescriptor<boolean> } &
  { [x: string]: PropertyDescriptor } = getOwnPropertyDescriptors(obj);

const objDescs: { a: TypedPropertyDescriptor<number>; b: TypedPropertyDescriptor<string>; c: TypedPropertyDescriptor<boolean> } &
  { [x: string]: PropertyDescriptor } = Object.getOwnPropertyDescriptors(obj);

class Foo {
  bar = 42;
  baz() {}
}
const foo = new Foo();

const fooDescs: { bar: TypedPropertyDescriptor<number>; baz: TypedPropertyDescriptor<() => void> } &
  { [x: string]: PropertyDescriptor } = Object.getOwnPropertyDescriptors(foo);
const descsAny = Object.getOwnPropertyDescriptors({ x: 1, y: 2 });

// @ts-expect-error
getOwnPropertyDescriptors();

// @ts-expect-error
Object.getOwnPropertyDescriptors();
