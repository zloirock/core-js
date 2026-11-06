import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Each key belongs to its own hop; a proxy's name never substitutes a nested user key.
const proxyKey = 'self',
  ctorKey = 'Promise',
  userKey = 'userSlotKey';
const {
  prototype
} = _Promise;
let groupBy, at;
({
  [userKey]: {
    groupBy
  } = {
    groupBy: _Map$groupBy
  }
} = _globalThis);
({
  [userKey]: {
    at
  } = {
    at: _atMaybeArray([1, 2])
  }
} = _globalThis);
use(prototype, groupBy, at);

// A used assignment yields the whole receiver, including through a proxy hop.
const mapKey = 'Map';
let usedPrototype;
const kept = ({
  prototype: usedPrototype
} = _Map, _globalThis);
const keptComputed = ({
  prototype: usedPrototype
} = _Map, _globalThis);
use(kept, keptComputed, usedPrototype);
let unknown;
const keptUnknown = ({
  Array: {
    unknown
  }
} = _globalThis, _globalThis);
use(typeof unknown);
let hits = 0;
const keptEffects = (++hits, ++hits, {
  prototype: usedPrototype
} = _Promise, _globalThis);
use(keptEffects, usedPrototype, hits);