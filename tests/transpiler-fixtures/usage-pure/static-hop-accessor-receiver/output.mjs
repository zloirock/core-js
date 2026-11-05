import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Accessor-backed member reads inside literal slots execute once in source order.
// Their nested static reads remain native across wrapper, alias and sibling hosts.
const log = [];
const {
  w: {
    from: one
  }
} = {
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'a');
      return Array;
    }
  }.w
};
const {
  a: {
    b: {
      from: two
    }
  }
} = {
  a: {
    b: {
      get w() {
        _pushMaybeArray(log).call(log, 'b');
        return Array;
      }
    }.w
  }
};
const [{
  w: {
    from: viaWrapper
  }
}] = [{
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'c');
      return Array;
    }
  }.w
}];
const held = {
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'd');
      return Array;
    }
  }.w
};
const {
  w: {
    from: viaAlias
  }
} = held;
const {
  w: {
    from: beside
  },
  z
} = {
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'e');
      return Array;
    }
  }.w,
  z: 7
};
let assigned;
({
  w: {
    from: assigned
  }
} = {
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'f');
      return Array;
    }
  }.w
});
export { one, two, viaWrapper, viaAlias, beside, z, assigned, log };