import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a catch parameter is evaluated outside the clause's body block, so its default reads past what that
// block binds in itself - `let` / `const` / `class` / a strict function - to a global or the outer
// binding, while a `var` of the body hoists past the block to the function, so the default reads that
// one, its initializer not run yet. the `Promise` and `Iterator` reads load their families; distinct
// member per line
try {
  f();
} catch ({
  p = Promise.resolve(1)
}) {
  let Promise = 1;
  use(p, Promise);
}
const s = 'abc';
try {
  f();
} catch ({
  q = s.at(-1)
}) {
  class s {}
  use(q, s);
}
try {
  f();
} catch ({
  r = Iterator.from(x)
}) {
  function Iterator() {}
  use(r, Iterator);
}
const list = [1, 2];
function g() {
  try {
    f();
  } catch ({
    t = list.includes(2)
  }) {
    var list = 'abc';
    use(t, list);
  }
}