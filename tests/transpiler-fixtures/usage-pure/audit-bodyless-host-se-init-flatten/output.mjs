import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Bodyless hosts keep initializer effects and served bindings under the same guard.
// The array-wrapped static stays native while the direct realm forms extract their methods.
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

// The array-wrapped twin keeps its native static read inside the bodyless branch.
if (c) var [{
  Array: {
    of
  }
}] = [(eff('b'), _globalThis)];

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