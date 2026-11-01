import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// Each key belongs to its own hop; a proxy's name never substitutes a nested user key.
const proxyKey = 'self',
  ctorKey = 'Promise',
  userKey = 'userSlotKey';
const {
  [proxyKey]: {
    [ctorKey]: {
      prototype
    }
  }
} = globalThis;
let groupBy, at;
({
  self: {
    [userKey]: {
      groupBy
    } = Map
  }
} = globalThis);
({
  self: {
    [userKey]: {
      at
    } = [1, 2]
  }
} = globalThis);
use(prototype, groupBy, at);

// A used assignment yields the whole receiver, including through a proxy hop.
const mapKey = 'Map';
let usedPrototype;
const kept = {
  self: {
    Map: {
      prototype: usedPrototype
    }
  }
} = globalThis;
const keptComputed = {
  [proxyKey]: {
    [mapKey]: {
      prototype: usedPrototype
    }
  }
} = globalThis;
use(kept, keptComputed, usedPrototype);
let unknown;
const keptUnknown = {
  globalThis: {
    Array: {
      unknown
    }
  }
} = globalThis;
use(typeof unknown);
let hits = 0;
const keptEffects = {
  [(++hits, proxyKey)]: {
    [(++hits, ctorKey)]: {
      prototype: usedPrototype
    }
  }
} = globalThis;
use(keptEffects, usedPrototype, hits);