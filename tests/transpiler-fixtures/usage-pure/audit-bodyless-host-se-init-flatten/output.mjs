import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Bodyless control statements keep initializer effects and pure bindings under the same guard.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let c = 1;
if (c) var {
  Array: {
    from
  }
} = (eff('a'), {
  Array: {
    from: _Array$from
  }
});

// array-wrapped twin: the wrapper descent and the block-wrap compose
if (c) var [{
  Array: {
    of
  }
}] = [(eff('b'), {
  Array: {
    of: _Array$of
  }
})];

// bodyless loop arm
while (c--) var {
  Array: {
    fromAsync
  }
} = (eff('c'), {
  Array: {
    fromAsync: _Array$fromAsync
  }
});

// assignment host on a bodyless slot keeps its own channel
let groupBy;
if (seen.length) ({
  Map: {
    groupBy
  }
} = (eff('d'), {
  Map: {
    groupBy: _Map$groupBy
  }
}));
export { from, of, fromAsync, groupBy, seen };