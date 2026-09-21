import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const order = [];
const eff = tag => (_pushMaybeArray(order).call(order, tag), tag);
const {
  [(eff('static'), 'Array')]: {
    from: viaStatic
  }
} = {
  Array: {
    from: _Array$from
  }
};
const _ref2 = _globalThis,
  {
    [(eff('nav'), 'Array')]: _ref
  } = null == _ref2 ? _ref2[""] : _ref2,
  {
    prototype: _ref3
  } = _ref,
  _ref4 = _ref3,
  viaNav = null == _ref4 ? _ref4[""] : _valuesMaybeArray(_ref4);
const {
  [(eff('literal'), 'w')]: {
    of: viaLiteral
  }
} = {
  w: {
    of: _Array$of
  }
};
const _ref6 = {
    w: src
  },
  {
    [(eff('alias'), 'w')]: _ref5
  } = null == _ref6 ? _ref6[""] : _ref6,
  _ref7 = _ref5,
  viaAliasSlot = null == _ref7 ? _ref7[""] : _at(_ref7);
// An instance leaf uses the captured selected slot, so the hop and method are not reread.
const _ref9 = {
    w: [1]
  },
  {
    [(eff('memo'), 'w')]: _ref8
  } = null == _ref9 ? _ref9[""] : _ref9,
  _ref10 = _ref8,
  viaLiteralSlot = null == _ref10 ? _ref10[""] : _includesMaybeArray(_ref10);
const {
  [(eff('sibling'), 'Object')]: {
    entries: viaSibling
  },
  z
} = {
  Object: {
    entries: _Object$entries
  },
  z: _globalThis.z
};
const {
  [(eff('pair'), 'Object')]: {
    keys: viaPairA,
    values: viaPairB
  }
} = {
  Object: {
    keys: _Object$keys,
    values: _Object$values
  }
};
const viaRest = _Object$fromEntries;
const {
  [(eff('rest'), 'Object')]: _unused,
  ...rest
} = _globalThis;
let viaAssign;
({
  [(eff('assign'), 'Object')]: {
    groupBy: viaAssign
  }
} = {
  Object: {
    groupBy: _Object$groupBy
  }
});
function viaParam({
  [(eff('param'), 'Object')]: {
    hasOwn: h
  }
} = {
  Object: {
    hasOwn: _Object$hasOwn
  }
}) {
  return h;
}
const {
  [(eff('proxy'), 'self')]: {
    Math: {
      trunc: viaProxyHop
    }
  }
} = {
  self: {
    Math: {
      trunc: _Math$trunc
    }
  }
};
const {
  a: {
    [(eff('deep'), 'Math')]: {
      sign: viaDeep
    }
  }
} = {
  a: {
    Math: {
      sign: _Math$sign
    }
  }
};
const {
  [(eff('default'), 'Object')]: {
    assign: viaDefault = null
  }
} = {
  Object: {
    assign: _Object$assign
  }
};
const _ref12 = _globalThis,
  {
    [(eff('symbol'), 'Array')]: _ref11
  } = null == _ref12 ? _ref12[""] : _ref12,
  _ref13 = _ref11,
  viaSymbol = null == _ref13 ? _ref13[""] : _getIteratorMethod(_ref13);
export { order, viaStatic, viaNav, viaLiteral, viaAliasSlot, viaLiteralSlot, viaSibling, z, viaPairA, viaPairB, viaRest, rest, viaAssign, viaParam, viaProxyHop, viaDeep, viaDefault, viaSymbol };

// An effectful receiver slot is evaluated once before its hop key; the selected instance
// method is then read once from that captured slot.
const _ref15 = {
    w: make()
  },
  {
    [(eff('call'), 'w')]: _ref14
  } = null == _ref15 ? _ref15[""] : _ref15,
  _ref16 = _ref14,
  viaEffectfulSlot = null == _ref16 ? _ref16[""] : _at(_ref16);
export { viaEffectfulSlot };