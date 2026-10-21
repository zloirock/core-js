import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
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
if (c) var [{
  Array: {
    of
  }
}] = [(eff('b'), _globalThis)];
while (c--) var {
  Array: {
    fromAsync
  }
} = (eff('c'), {
  Array: {
    fromAsync: _Array$fromAsync
  }
});
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