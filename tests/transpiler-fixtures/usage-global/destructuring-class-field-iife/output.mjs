import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class C {
  x = (() => {
    const {
      from
    } = Array;
    return from;
  })();
}