import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
// An inner default on a NON-function host - an assignment, a catch parameter, an object key, a
// declarator's array wrapper - takes the per-key fallback chain a parameter's does. Where the
// mirror declines (a non-identifier key, a repeated HOP key, a rest beside the leaves) every static
// leaf keeps the inline default, the nested one included; a key repeated over LEAVES does not
// decline it - one slot is one property, and the literal replaces the default whole; a pattern spelling only nested leaves
// mirrors the default from them; and a member target beside the leaves (an assignment-only shape)
// rides the mirror like any slot once its ROOT proves writable, so the flat leaf keeps no inline
// default there. Both legs print the same shapes.
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
  Map: M,
  ['Map']: alias,
  Array: {
    of
  }
} = {
  Map: _Map,
  Array: {
    of: _Array$of
  }
}] = [];
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
  Set: S,
  Array: {
    of: box.of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] = [];
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

// ... and a value-SELECTING inner default fills the default's arms, a member target taking the
// ponyfill in its own slot beside the sibling leaf. A selection every arm of which is the REALM names ONE object, so the
// literal replaces it whole - left standing, the probe selects natively wherever the host HAS
// `window`, and the polyfill the fallback arm carries attaches nowhere. The slot a literal cannot
// spell anchors on the operand the selection yields through, never on the probe's unbacked name
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
    } = {
      Map: {
        groupBy: _Map$groupBy
      },
      Promise: {
        race: _Promise$race
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
    } = {
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
  } = {
    Map: {
      groupBy: _Map$groupBy
    }
  }] = [];
  // ... a host slot no pairing reads through (a spread) still hands the pattern its default, and a
  // BARE backed left reaches the same literal by the other road - its right is dead rather than
  // realm-equal. A fallback the plan may not speak for is the negative: the selection stays whole
  // and native, so neither arm is polyfilled
  const extra = {};
  let gb4, gb5, gb6;
  ({
    k: {
      Map: {
        groupBy: gb4
      }
    } = {
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
  ({
    k: {
      Map: {
        groupBy: gb6
      }
    } = null == _globalThis.window ? extra : {
      Map: {
        groupBy: _Map$groupBy
      }
    }
  } = {});
  return [gb, gb2, z, gb3, gb4, gb5, gb6, box];
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