import "<CWD>/packages/core-js/modules/es.object.assign.js";
import "<CWD>/packages/core-js/modules/es.object.entries.js";
import "<CWD>/packages/core-js/modules/es.object.freeze.js";
import "<CWD>/packages/core-js/modules/es.object.from-entries.js";
import "<CWD>/packages/core-js/modules/es.object.keys.js";
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
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
import "<CWD>/packages/core-js/modules/es.number.is-safe-integer.js";
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
// the flatten's sibling walk climbs from a matched receiver identifier up its member chain to decide
// whether another channel owns it. a cast or a paren sitting BETWEEN the two is transparent to that
// question - the chain is still the one rooted at this receiver - so stopping there claimed a receiver
// the member's own rewrite then replaced wholesale. every wrapper the language puts in that position,
// with the key resolved in a nested scope and in place
const {
    Array: {
      of
    }
  } = globalThis,
  cast = (globalThis as any)['Promise'];
const {
    Array: {
      from
    }
  } = globalThis,
  nonNull = globalThis!['Set'];
const {
    Object: {
      entries
    }
  } = globalThis,
  paren = (globalThis as any).Promise;
const {
    Object: {
      assign
    }
  } = globalThis,
  satisfied = (globalThis satisfies object)['Map'];
const {
    Number: {
      isInteger
    }
  } = globalThis,
  nested = () => {
    const NAME = 'Promise';
    return (globalThis as any)[NAME];
  };

// a claim does not have to be ROOTED at the receiver to erase it: one that merely CONTAINS it takes
// it along, so the walk stands down there too. the argument of a call whose result is claimed, in
// both key spellings and through a static off a constructor
function identity(value) {
  return value;
}
const {
    Array: {
      isArray
    }
  } = globalThis,
  callArg = identity(globalThis).Promise;
const {
    Number: {
      isSafeInteger
    }
  } = globalThis,
  callArgComputed = identity(globalThis)['Set'];
const {
    Object: {
      freeze
    }
  } = globalThis,
  callArgStatic = identity(globalThis).Object.fromEntries([]);

// negatives: no wrapper at all, and a containing member whose key claims nothing
const {
    Number: {
      isFinite
    }
  } = globalThis,
  plain = globalThis['Promise'];
const {
    Object: {
      keys
    }
  } = globalThis,
  unclaimed = identity(globalThis).noSuchThing;
export { of, cast, from, nonNull, entries, paren, assign, satisfied, isInteger, nested, isFinite, plain };
export { isArray, callArg, isSafeInteger, callArgComputed, freeze, callArgStatic, keys, unclaimed };