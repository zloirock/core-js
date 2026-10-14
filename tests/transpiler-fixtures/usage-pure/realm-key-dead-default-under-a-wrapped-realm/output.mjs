import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A realm a pattern reads through a wrapper - a `window` read, a for-of over an array holding it, a sequence
// prefix, a TS assertion, a `self` hop above the key - still fills the key's slot, so a default on the key is dead
// all the same: no usage in usage-global, and in usage-pure it leaves with the level's mirror, its import too.
const {
  Map: {
    groupBy
  },
  JSON: J
} = ({} = window, {
  Map: {
    groupBy: _Map$groupBy
  },
  JSON: window.JSON
});
for (const {
  Promise: {
    allSettled
  }
} of [{
  Promise: {
    allSettled: _Promise$allSettled
  }
}]) use(allSettled);
const {
  Iterator: {
    concat
  }
} = (log(), {
  Iterator: {
    concat: _Iterator$concat
  }
});
const {
  Object: {
    entries
  }
} = {
  Object: {
    entries: _Object$entries
  }
} as any;
const {
  self: {
    Reflect: {
      ownKeys
    }
  }
} = {
  self: {
    Reflect: {
      ownKeys: _Reflect$ownKeys
    }
  }
};
export { groupBy, J, concat, entries, ownKeys };