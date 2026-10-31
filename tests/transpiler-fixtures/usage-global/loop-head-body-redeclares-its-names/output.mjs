import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// A loop head or catch pattern whose body block declares a name the pattern binds or reads stays
// where it is: moved into that block it would redeclare the name, or read the body's binding in
// place of the outer one. A shadow in a nested block leaves the top of the body free.
for (const {
  at,
  flat
} of list) {
  const flat = 1;
  use(at, flat);
}
for (const {
  w: [{
    findLast
  }]
} of list) {
  let findLast = 2;
  use(findLast);
}
for (const {
  [key]: m,
  includes
} of list) {
  let key = 3;
  use(m, includes);
}
let target;
for ({
  entries: target
} of list) {
  let target = 4;
  use(target);
}
try {
  risky();
} catch ({
  values = fallback
}) {
  let fallback = 5;
  use(values);
}
for (const {
  flatMap
} of list) {
  {
    let flatMap = 6;
    use(flatMap);
  }
  use(flatMap);
}