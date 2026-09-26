import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A sequence prefix runs once before a constructor residual is read.
// Assignments nested in that prefix keep their own effects and polyfills.
let eff = 0;
const {
  Array: {
    from: declFrom
  },
  Set: {
    customQ: declUnion
  }
} = (eff++, {
  Array: {
    from: _Array$from
  },
  Set: _Set
});
let from, customQ;
({
  Array: {
    from
  },
  Set: {
    customQ
  }
} = (eff++, {
  Array: {
    from: _Array$from
  },
  Set: _Set
}));
let inner;
({
  Array: {
    from
  },
  Set: {
    customQ
  }
} = ({
  Map: {
    groupBy: inner
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
}, {
  Array: {
    from: _Array$from
  },
  Set: _Set
}));
export { eff, declFrom, declUnion, from, customQ, inner };