import "core-js/modules/es.string.at";
class Foo {
  bar = () => 'hello';
}
const foo = new Foo();
foo.bar().at(0);