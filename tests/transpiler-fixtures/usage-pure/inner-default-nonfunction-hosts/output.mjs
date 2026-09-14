import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
// An inner default on a NON-function host - an assignment, a catch parameter, an object key, a
// declarator's array wrapper - takes the per-key fallback chain a parameter's does. Where the
// mirror declines (a non-identifier key, a duplicate key, a rest beside the leaves) every static
// leaf keeps the inline default, the nested one included; a pattern spelling only nested leaves
// mirrors the default from them; and a member target beside the leaves (an assignment-only shape)
// leaves the flat leaf its inline default. Both legs print the same shapes.
const getKey = () => 'Map';
const box = {};
let S, M, alias, of, rest, race, d;
[{
  Set: S = _Set,
  'with-dash': d,
  Array: {
    of = _Array$of
  }
} = _globalThis] = [];
[{
  Map: M = _Map,
  ['Map']: alias = _Map,
  Array: {
    of = _Array$of
  }
} = _globalThis] = [];
[{
  Set: S,
  Array: {
    of
  },
  ...rest
} = _globalThis] = [];
[{
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
}] = [];
[{
  Array: {
    of = _Array$of
  },
  'with-dash': d,
  Promise: {
    race = _Promise$race
  }
} = _globalThis] = [];
[{
  Set: S = _Set,
  Array: {
    of: box.of
  }
} = _globalThis] = [];
export const caught = (() => {
  try {
    throw [];
  } catch ([{
    Set: CS = _Set,
    'with-dash': cd,
    Array: {
      of: cof = _Array$of
    }
  } = _globalThis]) {
    return [CS, cd, cof];
  }
})();
export const keyed = (() => {
  const y = _Map;
  const {
    k: {
      Set: KS,
      [getKey()]: _unused,
      Array: {
        of: kof
      }
    } = {
      Set: _Set,
      Map: _Map,
      Array: {
        of: _Array$of
      }
    }
  } = {};
  const {
    k: {
      Array: {
        of: only
      }
    } = {
      Array: {
        of: _Array$of
      }
    }
  } = {};
  return [KS, y, kof, only];
})();

// ... and a value-SELECTING inner default is the per-branch mirror's shape on every host: the leaf
// reads that default exactly when the host's slot is empty, and the mirror fills the default's arms
// (a member target riding raw beside the ponyfilled leaf)
export const selecting = (() => {
  let gb;
  ({
    k: {
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
    }
  } = {});
  const {
    k: {
      Map: {
        groupBy: gb2
      },
      Promise: {
        customZ: z
      }
    } = _globalThis.window ?? {
      Map: {
        groupBy: _Map$groupBy
      },
      Promise: {
        customZ: _Promise.customZ
      }
    }
  } = {};
  const [{
    Map: {
      groupBy: gb3
    }
  } = _globalThis.window ?? {
    Map: {
      groupBy: _Map$groupBy
    }
  }] = [];
  // ... a host slot no pairing reads through (a spread) still hands the pattern its default, and an
  // ALL-proxy selecting default takes the shared plan's literal in place of the whole selection
  const extra = {};
  let gb4, gb5;
  ({
    k: {
      Map: {
        groupBy: gb4
      }
    } = _globalThis.window ?? {
      Map: {
        groupBy: _Map$groupBy
      }
    }
  } = {
    ...extra
  });
  ({
    k: {
      Map: {
        groupBy: gb5
      }
    } = {
      Map: {
        groupBy: _Map$groupBy
      }
    }
  } = {});
  return [gb, gb2, z, gb3, gb4, gb5, box];
})();
export const wrapped = (() => {
  const [{
    Set: WS = _Set,
    'with-dash': wd,
    Array: {
      of: wof = _Array$of
    }
  } = _globalThis] = [];
  const [{
    Array: {
      of: wonly
    }
  } = {
    Array: {
      of: _Array$of
    }
  }] = [];
  return [WS, wd, wof, wonly];
})();
export const r = [S, M, alias, of, rest, race, d, box];