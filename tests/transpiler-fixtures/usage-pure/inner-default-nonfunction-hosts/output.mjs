import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
// Inner defaults replace their receiver whole where a mirror can carry its keys.
// Quoted keys retain native reads; declined rest and unknown supplied receivers stay native.
// Member targets and repeated flat keys retain the same mirror as ordinary bindings.
const getKey = () => 'Map';
const box = {};
let S, M, alias, of, rest, race, d;
[{
  Set: S,
  'with-dash': d,
  Array: {
    of
  }
} = {
  Set: _Set,
  "with-dash": _globalThis["with-dash"],
  Array: {
    of: _Array$of
  }
}] = [];
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
    of
  },
  'with-dash': d,
  Promise: {
    race
  }
} = {
  Array: {
    of: _Array$of
  },
  "with-dash": _globalThis["with-dash"],
  Promise: {
    race: _Promise$race
  }
}] = [];
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
    Set: CS,
    'with-dash': cd,
    Array: {
      of: cof
    }
  } = {
    Set: _Set,
    "with-dash": _globalThis["with-dash"],
    Array: {
      of: _Array$of
    }
  }]) {
    return [CS, cd, cof];
  }
})();
export const keyed = (() => {
  const {
    k: {
      Set: KS,
      [getKey()]: y,
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

// Realm selections mirror the chosen default. Foreign fallback values remain native.
// Unbacked probes retain their own selection behavior.
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
      Promise: _Promise
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
  // A spread leaves its paired slot unknown; a foreign fallback stays native.
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
    Set: WS,
    'with-dash': wd,
    Array: {
      of: wof
    }
  } = {
    Set: _Set,
    "with-dash": _globalThis["with-dash"],
    Array: {
      of: _Array$of
    }
  }] = [];
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