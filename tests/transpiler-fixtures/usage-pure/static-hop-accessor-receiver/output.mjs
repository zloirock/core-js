import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
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