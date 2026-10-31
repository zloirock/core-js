import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// usage-global constructor parameter-property with a default whose initializer needs a polyfill
// (`constructor(public cache: WeakMap<...> = new WeakMap())`): the defaulted parameter-property
// parses as TSParameterProperty wrapping an AssignmentPattern, which crashed estree-toolkit's
// scope crawl before any transform. the default initializer must still inject. regression lock
export class Service {
  constructor(public cache: WeakMap<object, number> = new WeakMap()) {}
}
[Service];