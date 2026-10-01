import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a method destructured off a literal is the callee a call of the name runs, so a static read off
// its result is served - unless the file wrote that slot before the capture, which then holds no
// one certain function and keeps the read native. a write after the capture changes nothing
const early = {
  make() {
    return Map;
  }
};
early.make = () => Set;
const {
  make
} = early;
make().groupBy(src, fn);
const late = {
  build() {
    return Promise;
  }
};
const {
  build
} = late;
late.build = () => Set;
build().try(fn);