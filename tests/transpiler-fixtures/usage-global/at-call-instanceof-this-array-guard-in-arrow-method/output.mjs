import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  check(x) {
    const fn = () => {
      if (x instanceof this.Array) x.at(0);
    };
  }
}