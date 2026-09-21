import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Static receiver reads through accessors keep their effects exactly once.
// Nested, array-wrapped, aliased and sibling forms all receive the pure method.
const log = [];
const {
  w: {
    from: one
  }
} = {
  w: ({
    get w() {
      _pushMaybeArray(log).call(log, 'a');
      return Array;
    }
  }.w, {
    from: _Array$from
  })
};
const {
  a: {
    b: {
      from: two
    }
  }
} = {
  a: {
    b: ({
      get w() {
        _pushMaybeArray(log).call(log, 'b');
        return Array;
      }
    }.w, {
      from: _Array$from
    })
  }
};
const [{
  w: {
    from: viaWrapper
  }
}] = [{
  w: ({
    get w() {
      _pushMaybeArray(log).call(log, 'c');
      return Array;
    }
  }.w, {
    from: _Array$from
  })
}];
const held = {
  w: {
    get w() {
      _pushMaybeArray(log).call(log, 'd');
      return Array;
    }
  }.w
};
const viaAlias = _Array$from;
const {
  w: {
    from: beside
  },
  z
} = {
  w: ({
    get w() {
      _pushMaybeArray(log).call(log, 'e');
      return Array;
    }
  }.w, {
    from: _Array$from
  }),
  z: 7
};
let assigned;
({
  w: {
    from: assigned
  }
} = {
  w: ({
    get w() {
      _pushMaybeArray(log).call(log, 'f');
      return Array;
    }
  }.w, {
    from: _Array$from
  })
});
export { one, two, viaWrapper, viaAlias, beside, z, assigned, log };