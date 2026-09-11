import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a container declared in one LEXICAL scope and a same-named container written in a sibling scope
// are two bindings, and the census keys its records by the declaring scope: the write taints its own
// binding only, so the other's slot still binds the static - for a loop head (for-of, for-in, a
// for-init declarator), a block, a switch case and a catch parameter shadowing the name alike. a `var` is one binding
// across every block of its function, so a write through it in a sibling block reaches every read
const out = [];
for (const item of [{
  w: Object
}]) {
  const viaForOfHead = _Object$values;
  _pushMaybeArray(out).call(out, viaForOfHead);
}
for (const item of [{
  w: Array
}]) item.w = _Map;
for (const key in {
  w: Object
}) {
  const item = {
    w: Object
  };
  const viaForInBody = _Object$entries;
  _pushMaybeArray(out).call(out, viaForInBody, key);
}
for (const key in {
  w: Array
}) {
  const item = {
    w: Array
  };
  item.w = _Map;
  _pushMaybeArray(out).call(out, key);
}
for (let i = 0, item = {
    w: Object
  }; i < 1; i++) {
  const viaForInit = _Object$is;
  _pushMaybeArray(out).call(out, viaForInit);
}
for (let i = 0, item = {
    w: Array
  }; i < 1; i++) item.w = _Map;
{
  const item = {
    w: Object
  };
  const viaBlock = _Object$keys;
  _pushMaybeArray(out).call(out, viaBlock);
}
{
  const item = {
    w: Array
  };
  item.w = _Map;
}
switch (out.length) {
  default:
    {
      const item = {
        w: Object
      };
      const viaSwitchCase = _Object$assign;
      _pushMaybeArray(out).call(out, viaSwitchCase);
    }
}
switch (out.length) {
  default:
    {
      const item = {
        w: Array
      };
      item.w = _Map;
    }
}
const holder = {
  w: Object
};
try {
  throw {
    w: Array
  };
} catch (holder) {
  holder.w = _Map;
}
const viaCatchShadow = _Object$fromEntries;
_pushMaybeArray(out).call(out, viaCatchShadow);
{
  var shared = {
    w: Object
  };
  const {
    getOwnPropertyNames: viaVarWrittenElsewhere
  } = shared.w;
  _pushMaybeArray(out).call(out, viaVarWrittenElsewhere);
}
{
  var shared = {
    w: Array
  };
  shared.w = _Map;
}
export { out };