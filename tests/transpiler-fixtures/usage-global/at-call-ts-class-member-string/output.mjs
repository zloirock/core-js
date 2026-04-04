import "core-js/modules/es.string.at";
class Foo {
  label: string = '';
}
const f = new Foo();
f.label.at(-1);