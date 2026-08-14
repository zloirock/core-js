import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.to-string-tag";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.json.to-string-tag";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a catch pattern whose computed key forces the receiver extraction: the detection of a sibling
// prop is independent of whether the emitter rewrites it, so an unread binding still contributes
// its module here - one method per clause keeps the three rows from masking each other
try {
  risky1();
} catch ({
  [Symbol.iterator]: it1,
  at
}) {
  console.log(it1);
}
try {
  risky2();
} catch ({
  [Symbol.asyncIterator]: it2,
  includes
}) {
  console.log(it2, includes);
}
try {
  risky3();
} catch ({
  [Symbol.toStringTag]: it3,
  flat,
  ...rest
}) {
  console.log(it3, rest);
}