import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the usage-global side of the usage-pure fixture of the same name, a presence guard: a method writing a static of
// the global past a class static block's same-name declaration patches the global, while the block's write to its
// own declaration's member patches nothing global - but usage-global loads a patched static's module all the same,
// so both reads load theirs either way.
class C {
  static {
    let Array = 1;
  }
  static patch() {
    Array.from = function () {
      return [];
    };
  }
}
export const a = Array.from([1]);
class D {
  static {
    let Object = {
      groupBy: 1
    };
    Object.groupBy = 2;
  }
}
export const b = Object.groupBy([], x => x);