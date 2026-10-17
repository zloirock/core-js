import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `namespace X {}` shadows the global X only when it is INSTANTIATED (emits a runtime object). a
// namespace whose members are all tsc-elided (a `const enum` is inlined, an interface / type alias
// erases) emits nothing, so X stays the global and its usage must be polyfilled. a regular `enum`
// DOES instantiate the namespace, keeping the shadow. instantiation recurses: a namespace whose only
// member is another namespace is instantiated iff that inner one is - so a const-enum-only inner keeps
// the outer elided too. the three receivers below diverge on exactly this.
namespace Map {
  const enum E {}
}
namespace Set {
  export enum R {}
}
namespace Array {
  namespace Inner {
    const enum E {}
  }
}
new Map([[1, 2]]);
new Set([1]);
Array.from([1]);