import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a computed `Symbol.X` key kept inside an ANCHORED residual re-keys to the polyfilled
// symbol binding (the whole-prop render must not leak raw `Symbol` text - a ReferenceError
// on symbol-less engines): a well-known name uses its dedicated entry, an unknown name
// polyfills the constructor read, and a scope-shadowed `Symbol` stays the user's own object
const _ref = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const a = _getIteratorMethod(_ref.Map);
const {
  Object: {
    fromEntries: fe
  }
} = _ref;
a;
fe(x);
const {
  Set: {
    [_Symbol$asyncIterator]: b
  },
  Object: {
    fromEntries: fe2
  }
} = {
  Set: _Set,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
b;
fe2(y);
const {
  WeakMap: {
    [_Symbol.foo]: c
  },
  Object: {
    fromEntries: fe3
  }
} = {
  WeakMap: _WeakMap,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
c;
fe3(z);
function shadowed(Symbol) {
  const {
    Map: {
      [Symbol.iterator]: d
    },
    Object: {
      fromEntries: fe4
    }
  } = {
    Map: _Map,
    Object: {
      fromEntries: _Object$fromEntries
    }
  };
  return [d, fe4];
}
shadowed({
  iterator: 'k'
});
// the SPELLING of `Symbol` is the canon's question, not this render's: a capitalised const alias and
// a proxy-global access name the same global, so they re-key like the bare name - read as a bare
// Identifier only, they leaked raw `Symbol` text into the residual. a SLOT-mutated `Symbol` is the
// opposite direction and must NOT re-key: the user's replacement does not carry the well-known
// symbols, so the read stays on their object
const Sym = _Symbol;
const _ref2 = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const aliased = _getIteratorMethod(_ref2.Map);
const {
  Object: {
    fromEntries: fe6
  }
} = _ref2;
aliased;
fe6(u1);
const _ref3 = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const viaProxy = _getIteratorMethod(_ref3.Map);
const {
  Object: {
    fromEntries: fe7
  }
} = _ref3;
viaProxy;
fe7(u2);
const _ref4 = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const viaHop = _getIteratorMethod(_ref4.Map);
const {
  Object: {
    fromEntries: fe8
  }
} = _ref4;
viaHop;
fe8(u3);
// the re-key must not depend on WHICH sibling dispatched the flatten (the key visitor may
// or may not have fired on the original before the residual is cloned / sliced), nor on the
// host kind - an assignment host re-keys the same way
const _ref5 = {
  Object: {
    fromEntries: _Object$fromEntries
  },
  Map: _Map
};
const {
  Object: {
    fromEntries: fe5
  }
} = _ref5;
const e = _getIteratorMethod(_ref5.Map);
fe5(w);
e;
let f2, g2;
({
  Object: {
    fromEntries: g2
  },
  Set: {
    [_Symbol$asyncIterator]: f2
  }
} = {
  Object: {
    fromEntries: _Object$fromEntries
  },
  Set: _Set
});
g2(v);
f2;