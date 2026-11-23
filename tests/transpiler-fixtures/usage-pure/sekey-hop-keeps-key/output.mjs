import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// Computed hop keys retain their effects before supported leaf captures and native residuals.
// Instance and static readers keep the receiver selected at their own source level.
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
  w: Array
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
const {
  [(eff('sibling'), 'Object')]: {
    entries: viaSibling
  },
  z
} = {
  Object: {
    entries: _Object$entries
  },
  get z() {
    return _globalThis.z;
  }
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
const {
    [(eff('rest'), 'Object')]: {}
  } = _globalThis,
  viaRest = _Object$fromEntries,
  rest = (_ref4 => {
    const _ref9 = {};
    const _ref6 = _Reflect$ownKeys(typeof _ref4 === "object" || typeof _ref4 === "function" ? _ref4 : {
      ..._ref4
    });
    for (let _ref5 = 0; _ref5 < _ref6.length; _ref5 += 1) {
      const _ref7 = _ref6[_ref5];
      const _ref8 = _ref7 !== "Object" && _Object$getOwnPropertyDescriptor(_ref4, _ref7);
      if (_ref8 && _ref8.enumerable) _Object$defineProperty(_ref9, _ref7, {
        __proto__: null,
        value: _ref4[_ref7],
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return _ref9;
  })(_globalThis);
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
  a: _globalThis
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
    [(eff('symbol'), 'Array')]: _ref10
  } = _globalThis,
  viaSymbol = _getIteratorMethod(_ref10);
export { order, viaStatic, viaNav, viaLiteral, viaAliasSlot, viaLiteralSlot, viaSibling, z, viaPairA, viaPairB, viaRest, rest, viaAssign, viaParam, viaProxyHop, viaDeep, viaDefault, viaSymbol };

// An effectful receiver slot is evaluated once before its hop key; the selected instance
// method is then read once from that captured slot.
const {
    [(eff('call'), 'w')]: _ref11
  } = {
    w: make()
  },
  viaEffectfulSlot = _at(_ref11);
export { viaEffectfulSlot };