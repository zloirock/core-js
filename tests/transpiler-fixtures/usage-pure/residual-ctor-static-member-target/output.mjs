import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// A leaf whose target is a MEMBER SLOT takes the static's ponyfill exactly as a binding leaf does:
// the extraction writes it into the slot the source named (`box.race = _Promise$race`). What decides
// is the target's ROOT, never that the target is a member - a root that stands for a global would
// make the write install the ponyfill in the realm, which pure never does, so only a root the value
// canon proves ordinary (a local binding holding no realm object) takes the extraction. A leaf whose
// key names no polyfillable static of the ctor keeps reading through the residual, which re-anchors
// on the ctor's pure binding as always, and a leaf DEFAULT is dead text over an import that is never
// undefined, so it drops the way a binding leaf's does.
const box = {};
let S, of, race, customZ;
box.race = _Promise$race;
box.g = _Map$groupBy;
box.f = _Iterator$from;
box.sf = _Symbol$for;
({
  customZ
} = _Promise);
box.race = _Promise$race;
({
  customZ
} = _Promise);
// ... and a COMPUTED key extracts where it FOLDS to the static's name (`[k]` with `const k = 'race'`,
// `['race']`, a template); a key carrying an EFFECT keeps the residual, which is where that effect
// still has to run, and the slot reads natively there
race = _Promise$race;
const k = 'race';
let n = 0;
box.race = _Promise$race;
box.race = _Promise$race;
({
  Promise: {
    [(n++, 'race')]: box.race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
// ... and a PATTERN under the folded static key destructures the static's own ponyfill, as the
// literal key does (`_Promise$race.length`), on the declarator and the assignment host alike
const {
  length: viaDecl
} = _Promise$race; // ... and a SELECTING receiver standing as the host's own slot collapses before any of this, so the
// rows below read a plain proxy receiver and the member target extracts off it like any leaf
let all;
box.race = _Promise$race;
all = _Promise$all;
box.race = _Promise$race;
// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
box.race = _Promise$race;
let gb, it;
gb = _Map$groupBy;
box.race = _Promise$race;
gb = _Map$groupBy;
it = _getIteratorMethod(_Symbol);
let viaAssign;
// ... and an ARRAY-WRAPPER default renders the whole level as a literal, which the member target
// rides like any slot: the ponyfill sits in the literal and the pattern writes it into the author's
// own object (`race: _Promise$race` beside `Set: _Set`)
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
    race: _Promise$race
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
    of: _Array$of
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
    of: _Array$of
  }
}] = [];
export const r = [S, of, race, customZ, box, viaDecl, viaAssign, all, gb, it];