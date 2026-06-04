import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global realistic DI: a constructor with TWO defaulted parameter-properties of different
// shapes (`public readonly cache = new Map()`, `private items = [...]`). both parse as
// TSParameterProperty wrapping an AssignmentPattern and crashed estree-toolkit's scope crawl; both
// default initializers must still be processed. regression lock
export class Service {
  constructor(public readonly cache: Map<string, number> = new Map(), private items = [1, 2, 3]) {}
}
[Service];