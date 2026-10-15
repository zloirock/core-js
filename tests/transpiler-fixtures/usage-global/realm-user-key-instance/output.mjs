import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// User keys on a realm can contain instances; they do not name built-in namespaces.
// Instance imports cover values reached through defaults, aliases and optional receivers.
const {
  Data: {
    at
  }
} = globalThis;
let includes;
({
  data: {
    includes
  }
} = globalThis);
const {
  Data: {
    flat = /* method default */fallback()
  }
} = (/* receiver prefix */touch(), globalThis);
const {
  Data: {
    findLast
  },
  sibling
} = globalThis;
const {
  Data: {
    map = fallback()
  }
} = globalThis;
const {
  Data: {
    filter
  }
} = globalThis?.self;
const [{
  self: {
    Data: {
      flatMap
    } = fallback()
  }
}] = [globalThis];
const {
  Data: {
    join
  } = fallback()
} = globalThis?.self;
const {
  data: {
    findLastIndex
  }
} = globalThis || {};
const {
  Data: {
    toReversed
  }
} = true ? globalThis : {};
const {
  data: {
    toSorted
  }
} = (touch(), globalThis) ?? {};
const {
  Data: {
    toSpliced
  }
} = (touch(), globalThis || {});
const realm = globalThis;
const {
  data: {
    find
  }
} = realm;
for (const {
  Data: {
    findIndex
  }
} of [globalThis]) consume(findIndex);
export { at, includes, flat, findLast, sibling, map, filter, find };