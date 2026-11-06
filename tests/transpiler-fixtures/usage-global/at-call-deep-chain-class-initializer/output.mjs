import "core-js/modules/es.array.at";
const data = [1, 2, 3];
const ref = data;
class Foo {
  items = ref;
}
new Foo().items.at(-1);