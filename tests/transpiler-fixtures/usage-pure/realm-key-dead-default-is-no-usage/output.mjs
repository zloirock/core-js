import _DOMException from "@core-js/pure/actual/dom-exception";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _queueMicrotask from "@core-js/pure/actual/queue-microtask";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _URLSearchParams from "@core-js/pure/actual/url-search-params/constructor";
// A default on a realm key whose slot the realm always fills never runs: like the dead part of a decided
// selection it is no usage, and pure drops it with the level's mirror, whatever spells the realm - itself, an
// alias, `self`, an assignment's value. A leaf pure leaves reading the realm raw keeps its default as written
// (`J`). A parameter's realm default stands in for a caller's object, and an undecided selection's other arm is
// no realm: a default there may run and keeps its import (`URLSearchParams`, `queueMicrotask`).
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
const realm = _globalThis;
const {
  Promise: {
    allSettled
  }
} = {
  Promise: {
    allSettled: _Promise$allSettled
  }
};
const {
  Iterator: {
    concat
  }
} = {
  Iterator: {
    concat: _Iterator$concat
  }
};
let entries;
({
  Object: {
    entries
  }
} = {
  Object: {
    entries: _Object$entries
  }
});
const {
  JSON: J = _DOMException
} = _globalThis;
export function parameter({
  Reflect: {
    ownKeys
  } = _URLSearchParams
} = {
  Reflect: {
    ownKeys: _Reflect$ownKeys
  }
}) {
  return ownKeys;
}
const {
  Math: {
    sumPrecise
  } = _queueMicrotask
} = flag ? {
  Math: {
    sumPrecise: _Math$sumPrecise
  }
} : other;
export { groupBy, allSettled, concat, entries, J, sumPrecise };