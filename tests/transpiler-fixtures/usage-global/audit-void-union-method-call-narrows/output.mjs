import "core-js/modules/es.string.at";
// TSVoidKeyword in a union must filter out the void branch the same way TSUndefinedKeyword
// does. Without that filtering, member-call return inference bails for the whole union
// and the dispatcher over-emits both array and string polyfills for a method whose return
// is statically known to be string.
interface Foo {
  method(): string;
}
// @ts-expect-error a void arm, nullish at runtime, is the shape under test
function f(x: Foo | void) {
  return x.method().at(0);
}