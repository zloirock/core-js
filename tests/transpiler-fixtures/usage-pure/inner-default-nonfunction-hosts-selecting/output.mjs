import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
const box = {};
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
export const r = [box];