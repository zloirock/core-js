import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write through a pattern slot with a default holds the default wherever the slot comes up undefined, so the value
// the source pairs with the slot does not decide the read: it stays open in an assignment, an element, a nested
// level, a `var` redeclaration and an assignment inside an initializer alike, and loads the method of every type
// that carries it. Without a default the paired value decides it.
export function paired(flag) {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: flag ? [1] : undefined
  });
  return list.at(-1);
}
export function undefinedSlot() {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: undefined
  });
  return list.includes(3);
}
export function element() {
  let list = [3, 4];
  [list = [1].values()] = [undefined];
  return list.find(x => x);
}
export function nested() {
  let list = [3, 4];
  ({
    a: {
      b: list = [1].keys()
    }
  } = {
    a: {
      b: undefined
    }
  });
  return list.filter(x => x);
}
export function redeclared() {
  var list = [3, 4];
  var {
    a: list = [1].entries()
  } = {
    a: undefined
  };
  return list.flatMap(x => [x]);
}
export function initializer() {
  let list = [3, 4];
  const settled = ({
    a: list = 'ab'[Symbol.iterator]()
  } = {
    a: undefined
  }, 0);
  return [settled, list.map(x => x)];
}
export function control() {
  let list = function* () {
    yield 1;
  }();
  ({
    a: list
  } = {
    a: [1]
  });
  return list.join();
}