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
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
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
// Top-level this is a global proxy. Usage-global retains conservative instance imports
// for unknown user slots across declarations, assignments, aliases and loop heads.
// A sequence prefix stays on the receiver or inside its member read, and runs once.
const {
  Data: {
    at
  }
} = this;
const {
  data: {
    includes
  }
} = this;
let flat;
({
  Data: {
    flat
  }
} = this);
const read = () => {
  const {
    data: {
      findLast
    }
  } = this;
  return findLast;
};
const {
  Data: {
    map
  },
  sibling
} = this;
const realm = this;
const {
  data: {
    filter
  }
} = realm;
const {
  Data: {
    join = /* method default */fallback(/*#__PURE__*/getA().toSorted())
  }
} = (/* receiver prefix */touch(), this);
for (const {
  Data: {
    find
  }
} of [this]) consume(find);
function capturedRealm() {
  const {
    data: {
      findIndex
    }
  } = realm;
  return findIndex;
}
function ownReceiver() {
  const {
    Data: {
      flatMap
    }
  } = this;
  return flatMap;
}
export { at, includes, flat, read, map, filter, sibling, capturedRealm, ownReceiver };