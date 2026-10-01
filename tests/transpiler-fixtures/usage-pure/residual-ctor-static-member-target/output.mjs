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
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
let S, of, race, customZ;
({
  Promise: {
    race: box.race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
({
  Map: {
    groupBy: box.g
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
});
({
  Iterator: {
    from: box.f
  }
} = {
  Iterator: {
    from: _Iterator$from
  }
});
({
  Symbol: {
    for: box.sf
  }
} = {
  Symbol: {
    for: _Symbol$for
  }
});
({
  Promise: {
    race: box.race,
    customZ
  }
} = {
  Promise: {
    race: _Promise$race,
    customZ: _Promise.customZ
  }
});
({
  customZ
} = _Promise);
({
  Promise: {
    race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
// ... and a COMPUTED key extracts where it FOLDS to the static's name (`[k]` with `const k = 'race'`,
// `['race']`, a template); a key carrying an EFFECT keeps the residual, which is where that effect
// still has to run, and the slot reads natively there
const k = 'race';
let n = 0;
({
  Promise: {
    [k]: box.race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
({
  Promise: {
    ['race']: box.race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
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
  Promise: {
    [k]: {
      length: viaDecl
    }
  }
} = {
  Promise: {
    race: _Promise$race
  }
};
// ... and a SELECTING receiver standing as the host's own slot collapses before any of this, so the
// rows below read a plain proxy receiver and the member target extracts off it like any leaf
let all;
({
  Promise: {
    race: box.race,
    all
  }
} = {
  Promise: {
    race: _Promise$race,
    all: _Promise$all
  }
});
({
  Promise: {
    race: box.race
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
({
  Promise: {
    race: box.race = 1
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
let gb, it;
({
  Map: {
    groupBy: gb
  },
  Promise: {
    race: box.race
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  },
  Promise: {
    race: _Promise$race
  }
});
({
  Map: {
    groupBy: gb
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  },
  Symbol: _Symbol
});
it = _getIteratorMethod(_Symbol);
let viaAssign;
({
  Promise: {
    [k]: {
      length: viaAssign
    }
  }
} = {
  Promise: {
    race: _Promise$race
  }
});

// ... and an ARRAY-WRAPPER default renders the whole level as a literal, which the member target
// rides like any slot: the ponyfill sits in the literal and the pattern writes it into the author's
// own object (`race: _Promise$race` beside `Set: _Set`)
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