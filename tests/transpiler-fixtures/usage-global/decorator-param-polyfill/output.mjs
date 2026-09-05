import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class Foo {
  constructor(@inject(Array.from('abc'))
  foo: string) {}
  method(@log(Object.fromEntries([]))
  arg: number) {}
}