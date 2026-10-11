import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a catch parameter's default reads a name that same parameter declares as that binding - a part of the
// caught value - never the global or an outer namesake, in an object or an array pattern alike: the
// statics stay the user's, and the instance read takes every family its member has. the array pattern
// brings the iteration modules; distinct member per line
const s = 'abc';
try {
  f();
} catch ({
  Promise,
  p = Promise.resolve(1)
}) {
  use(p);
}
try {
  f();
} catch ([Iterator, i = Iterator.from(x)]) {
  use(i);
}
try {
  f();
} catch ({
  s,
  q = s.at(-1)
}) {
  use(q);
}