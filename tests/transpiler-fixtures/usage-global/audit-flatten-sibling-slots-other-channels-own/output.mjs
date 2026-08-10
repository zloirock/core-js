import "<CWD>/packages/core-js/modules/es.object.assign.js";
import "<CWD>/packages/core-js/modules/es.object.entries.js";
import "<CWD>/packages/core-js/modules/es.object.freeze.js";
import "<CWD>/packages/core-js/modules/es.object.from-entries.js";
import "<CWD>/packages/core-js/modules/es.object.keys.js";
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.object.values.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.promise.resolve.js";
import "<CWD>/packages/core-js/modules/es.promise.all-settled.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.array.from.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.map.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.species.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert-computed.js";
import "<CWD>/packages/core-js/modules/es.number.constructor.js";
import "<CWD>/packages/core-js/modules/es.number.is-finite.js";
import "<CWD>/packages/core-js/modules/es.number.is-integer.js";
import "<CWD>/packages/core-js/modules/es.set.constructor.js";
import "<CWD>/packages/core-js/modules/es.set.species.js";
import "<CWD>/packages/core-js/modules/es.set.difference.js";
import "<CWD>/packages/core-js/modules/es.set.intersection.js";
import "<CWD>/packages/core-js/modules/es.set.is-disjoint-from.js";
import "<CWD>/packages/core-js/modules/es.set.is-subset-of.js";
import "<CWD>/packages/core-js/modules/es.set.is-superset-of.js";
import "<CWD>/packages/core-js/modules/es.set.symmetric-difference.js";
import "<CWD>/packages/core-js/modules/es.set.union.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
// the flatten's sibling walk substitutes proxy-global reads in the declarators it re-emits, but a
// slot another channel replaces WHOLESALE has no room for that transform: the `key in obj` fold,
// and all three receiver slots a synth swap owns - a destructure host's init and right, and an
// IIFE argument the callee destructures in its own param pattern, in every shape that invokes it
// (plain call, optional call, `new`). a computed hop key it cannot
// fold in the DECLARATION scope is not a verdict either: the natural visitor may still claim it
const {
    Array: {
      of
    }
  } = globalThis,
  hasMap = 'Map' in globalThis;
const {
    Object: {
      entries
    }
  } = globalThis,
  fnArg = function ({
    Promise
  }) {
    return Promise;
  }(globalThis);
const {
    Object: {
      assign
    }
  } = globalThis,
  arrowArg = (({
    Map
  }) => Map)(globalThis);
const {
    Promise: {
      allSettled
    }
  } = globalThis,
  secondArg = function (a, {
    Set
  }) {
    return Set;
  }(1, globalThis);
const {
    Object: {
      keys
    }
  } = globalThis,
  optionalArg = function ({
    Set
  }) {
    return Set;
  }?.(globalThis);
const {
    Object: {
      freeze
    }
  } = globalThis,
  constructedArg = new function ({
    Map
  }) {
    this.m = Map;
  }(globalThis);
const {
    Number: {
      isInteger
    }
  } = globalThis,
  nested = () => {
    const NAME = 'Promise';
    return globalThis[NAME];
  };

// negatives: a plain sibling read and a static off a known constructor keep their substitution,
// and an IIFE whose parameter is not a pattern owns nothing
const {
    Array: {
      from
    }
  } = globalThis,
  plain = globalThis;
const {
    Object: {
      values
    }
  } = globalThis,
  staticOff = globalThis.Object.fromEntries([]);
const {
    Number: {
      isFinite
    }
  } = globalThis,
  plainArg = function (g) {
    return g;
  }(globalThis);
export { of, hasMap, entries, fnArg, assign, arrowArg, allSettled, secondArg, isInteger, nested };
export { keys, optionalArg, freeze, constructedArg };
export { from, plain, values, staticOff, isFinite, plainArg };