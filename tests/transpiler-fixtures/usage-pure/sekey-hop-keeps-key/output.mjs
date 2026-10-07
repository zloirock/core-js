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
// Computed hop keys run in source order before the static or instance leaves they select.
// The selected slot is captured where needed; sibling reads, defaults and rest stay ordered.
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
const {
  [(eff('nav'), 'Array')]: _ref
} = _globalThis;
const viaNav = _valuesMaybeArray(_ref.prototype);
const {
  [(eff('literal'), 'w')]: {
    of: viaLiteral
  }
} = {
  w: {
    of: _Array$of
  }
};
const {
    [(eff('alias'), 'w')]: _ref2
  } = {
    w: src
  },
  viaAliasSlot = _at(_ref2);
// An instance leaf uses the captured selected slot, so the hop and method are not reread.
const {
    [(eff('memo'), 'w')]: _ref3
  } = {
    w: [1]
  },
  viaLiteralSlot = _includesMaybeArray(_ref3);
const viaSibling = _Object$entries;
const {
  [(eff('sibling'), 'Object')]: _unused,
  z
} = _globalThis;
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
  [(eff('rest'), 'Object')]: _unused2,
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
const {
    [(eff('symbol'), 'Array')]: _ref4
  } = _globalThis,
  viaSymbol = _getIteratorMethod(_ref4);
export { order, viaStatic, viaNav, viaLiteral, viaAliasSlot, viaLiteralSlot, viaSibling, z, viaPairA, viaPairB, viaRest, rest, viaAssign, viaParam, viaProxyHop, viaDeep, viaDefault, viaSymbol };

// An effectful receiver slot is evaluated once before its hop key; the selected instance
// method is then read once from that captured slot.
const {
    [(eff('call'), 'w')]: _ref5
  } = {
    w: make()
  },
  viaEffectfulSlot = _at(_ref5);
export { viaEffectfulSlot };