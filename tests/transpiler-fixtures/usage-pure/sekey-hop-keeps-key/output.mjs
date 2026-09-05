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
// a HOP whose key carries an effect keeps its level the way a rest sibling does: the hop retires to
// a sentinel, so the key runs exactly once where the source wrote it, and the claims below extract
// off the slot the folded key names - the flat effectful key's own shape, one level up. one static
// per row, so a row's extraction is attributable to its own host
const order = [];
const eff = tag => (_pushMaybeArray(order).call(order, tag), tag);
const viaStatic = _Array$from;
const {
  [(eff('static'), 'Array')]: _unused
} = _globalThis;
const viaNav = _valuesMaybeArray(_globalThis.Array.prototype);
const {
  [(eff('nav'), 'Array')]: _unused2
} = _globalThis;
const viaLiteral = _Array$of;
const {
  [(eff('literal'), 'w')]: _unused3
} = {
  w: Array
};
const viaAliasSlot = _at(src);
const {
  [(eff('alias'), 'w')]: {
    at: _unused4
  }
} = {
  w: src
};
// an instance leaf that reads its SLOT keeps its own sentinel inside the hop (the memo channel's
// shape); one that reads a built-in surface lets the hop retire whole
const _ref = [1];
const viaLiteralSlot = _includesMaybeArray(_ref);
const {
  [(eff('memo'), 'w')]: {
    includes: _unused5
  }
} = {
  w: _ref
};
const viaSibling = _Object$entries;
const {
  [(eff('sibling'), 'Object')]: _unused6,
  z
} = _globalThis;
const viaPairA = _Object$keys;
const viaPairB = _Object$values;
const {
  [(eff('pair'), 'Object')]: _unused7
} = _globalThis;
const viaRest = _Object$fromEntries;
const {
  [(eff('rest'), 'Object')]: _unused8,
  ...rest
} = _globalThis;
let viaAssign;
var _unused9;
({
  [(eff('assign'), 'Object')]: _unused9
} = _globalThis);
viaAssign = _Object$groupBy;
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
const viaProxyHop = _Math$trunc;
const {
  [(eff('proxy'), 'self')]: _unused10
} = _globalThis;
const viaDeep = _Math$sign;
const {
  a: {
    [(eff('deep'), 'Math')]: _unused11
  }
} = {
  a: _globalThis
};
const viaDefault = _Object$assign === void 0 ? null : _Object$assign;
const {
  [(eff('default'), 'Object')]: _unused12
} = _globalThis;
const viaSymbol = _getIteratorMethod(_globalThis.Array);
const {
  [(eff('symbol'), 'Array')]: _unused13
} = _globalThis;
export { order, viaStatic, viaNav, viaLiteral, viaAliasSlot, viaLiteralSlot, viaSibling, z, viaPairA, viaPairB, viaRest, rest, viaAssign, viaParam, viaProxyHop, viaDeep, viaDefault, viaSymbol };

// NEGATIVE: an effectful slot beside an effectful hop key has two effects to order and no memo
// that keeps the level - the pattern stays native on both legs
const {
  [(eff('call'), 'w')]: {
    at: viaEffectfulSlot
  }
} = {
  w: make()
};
export { viaEffectfulSlot };