import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A residual leaf naming one of the anchored ctor's OWN statics with no extraction to serve it - a
// member target, which the raw canon keeps - reads the native receiver: the pure ctor binding is
// the `*/constructor` entry, which carries none of the statics (`_Promise.race` is `undefined`).
// The sole-hop residual keeps the native receiver instead of re-anchoring on `_Promise` / `_Map` /
// `_Iterator` / `_Symbol`, and a mirrored literal spells the leaf as a raw read through the proxy
// (`_globalThis.Promise.race`), never the ponyfill - which would land in the user's object. A
// non-polyfillable key still re-anchors, and a binding leaf still extracts (the controls).
const box = {};
let S, of, race, customZ;
({
  Promise: {
    race: box.race
  }
} = _globalThis);
({
  Map: {
    groupBy: box.g
  }
} = _globalThis);
({
  Iterator: {
    from: box.f
  }
} = _globalThis);
({
  Symbol: {
    for: box.sf
  }
} = _globalThis);
({
  Promise: {
    race: box.race,
    customZ
  }
} = _globalThis);
({
  customZ
} = _Promise);
// ... and a COMPUTED key names the static as the literal does where it folds (`[k]` with
// `const k = 'race'`, `['race']`); a key nothing folds (an effect) may name any static at runtime,
// so that anchor declines too - the raw residual reads what the source read
race = _Promise$race;
const k = 'race';
let n = 0;
({
  Promise: {
    [k]: box.race
  }
} = _globalThis);
({
  Promise: {
    ['race']: box.race
  }
} = _globalThis);
({
  Promise: {
    [(n++, 'race')]: box.race
  }
} = _globalThis);
// ... and a PATTERN under the folded static key destructures the static's own ponyfill, as the
// literal key does (`_Promise$race.length`), on the declarator and the assignment host alike
const {
  length: viaDecl
} = _Promise$race; // ... and under a SELECTING receiver the fallback arm's mirror keeps the member target as a RAW
// slot beside the ponyfilled sibling (`race: _globalThis.Promise.race, all: _Promise$all`), does
// not fire where every leaf is one, and a defaulted member target keeps the user's default
let all;
({
  Promise: {
    race: box.race,
    all
  }
} = _globalThis.window ?? {
  Promise: {
    race: _globalThis.Promise.race,
    all: _Promise$all
  }
});
({
  Promise: {
    race: box.race
  }
} = _globalThis.window ?? _globalThis);
({
  Promise: {
    race: box.race = 1
  }
} = _globalThis.window ?? _globalThis);
// ... and a MULTI-hop pattern under the selecting receiver renders one literal: a hop with nothing
// to polyfill joins it as a passthrough beside the sibling hop's ponyfill (a member target raw,
// a well-known-symbol leaf as the hop's own value)
let gb, it;
({
  Map: {
    groupBy: gb
  },
  Promise: {
    race: box.race
  }
} = _globalThis.window ?? {
  Map: {
    groupBy: _Map$groupBy
  },
  Promise: {
    race: _globalThis.Promise.race
  }
});
({
  Map: {
    groupBy: gb
  },
  Symbol: {
    [_Symbol$iterator]: it
  }
} = _globalThis.window ?? {
  Map: {
    groupBy: _Map$groupBy
  },
  Symbol: _globalThis.Symbol
});
let viaAssign;
({
  length: viaAssign
} = _Promise$race);
[{
  Set: S,
  Array: {
    of
  },
  Promise: {
    race: box.race
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  },
  Promise: {
    race: _globalThis.Promise.race
  }
}] = [];
[{
  Array: {
    of: box.of
  },
  Promise: {
    race
  }
} = {
  Array: {
    of: _globalThis.Array.of
  },
  Promise: {
    race: _Promise$race
  }
}] = [];
[{
  Promise: {
    race
  },
  Array: {
    of: box.of
  }
} = {
  Promise: {
    race: _Promise$race
  },
  Array: {
    of: _globalThis.Array.of
  }
}] = [];
export const r = [S, of, race, customZ, box, viaDecl, viaAssign, all, gb, it];