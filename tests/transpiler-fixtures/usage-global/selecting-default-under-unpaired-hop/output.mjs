import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the level above the default pairs nothing in the host's literal - absent under an empty default of
// its own, absent outright (a native throw ahead of the default), or behind a spread - so the default's
// own walk answers alone and both legs mirror it through the shared plan
const {
  k: {
    m: {
      Map: {
        groupBy: a
      }
    } = globalThis.window ?? globalThis
  } = {}
} = {};
let b;
({
  w: {
    k: {
      Object: {
        fromEntries: b
      }
    } = globalThis.window ?? globalThis
  }
} = {});
const {
  k: {
    m: {
      Promise: {
        withResolvers: c
      }
    } = user ?? globalThis
  }
} = {
  k: {},
  ...other
};
const {
  k: {
    m: {
      Array: {
        from: d
      }
    } = globalThis
  } = {}
} = {};
export { a, b, c, d };