import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a for-x HEAD over a LONGER literal answers a static claim when every element reads the same on
// every pass: one identifier, or a literal container spelling the same keys and positions over such
// leaves. the render still mirrors each element on its own. one static per row
for (const {
  is: viaIdentifiers
} of [{
  is: _Object$is
}, {
  is: _Object$is
}]) viaIdentifiers;
for (const {
  w: {
    keys: viaHop
  }
} of [{
  w: {
    keys: _Object$keys
  }
}, {
  w: {
    keys: _Object$keys
  }
}]) viaHop;
for (const [{
  values: viaWrap
}] of [[{
  values: _Object$values
}], [{
  values: _Object$values
}]]) viaWrap;
for (const {
  w: [{
    entries: viaHopWrap
  }]
} of [{
  w: [{
    entries: _Object$entries
  }]
}, {
  w: [{
    entries: _Object$entries
  }]
}]) viaHopWrap;
for (const {
  w: {
    x: {
      hasOwn: viaTwoHops
    }
  }
} of [{
  w: {
    x: {
      hasOwn: _Object$hasOwn
    }
  }
}, {
  w: {
    x: {
      hasOwn: _Object$hasOwn
    }
  }
}]) viaTwoHops;
// ... read through the transparent wrappers a source may spell (a paren node one parser keeps)
for (const {
  w: {
    isFrozen: viaParens
  }
} of [{
  w: {
    isFrozen: _Object$isFrozen
  }
}, {
  w: {
    isFrozen: _Object$isFrozen
  }
}]) viaParens;

// a DUAL name (a static and an instance method alike: `entries`, `keys`, `values`) under a hop is the
// mirror's claim like a static-only one: the relocation that minted a host for it read the leaf
// typelessly as an instance method and lost the constructor's name (`_entries(_ref.w)`)
for (const {
  w: {
    entries: viaDualHop
  }
} of [{
  w: {
    entries: _Object$entries
  }
}]) viaDualHop;
for (const {
  w: {
    keys: viaDualMulti
  }
} of [{
  w: {
    keys: _Object$keys
  }
}, {
  w: {
    keys: _Object$keys
  }
}]) viaDualMulti;
for (const {
  w: [{
    values: viaDualWrap
  }]
} of [{
  w: [{
    values: _Object$values
  }]
}]) viaDualWrap;
for (const {
  w: {
    entries: viaDualDefault = null
  }
} of [{
  w: {
    entries: _Object$entries
  }
}]) viaDualDefault;
for (const [{
  keys: viaDualArrayHead
}] of [[{
  keys: _Object$keys
}], [{
  keys: _Object$keys
}]]) viaDualArrayHead;
// ... beside a leaf the mirror cannot answer, the head relocates for that leaf and the static
// still extracts: the relocated pattern reads the iterated literal's element, not the minted name
// (a pattern the source wrote that way reads the same), and a primitive slot differing per pass
// carries no claim
for (const _ref of [{
  w: Object,
  at: 1
}]) {
  let viaDualBesideData = _Object$entries;
  let {
    at: viaDataBeside
  } = _ref;
  [viaDualBesideData, viaDataBeside];
}
for (const _ref2 of [{
  w: Object,
  y: [1]
}]) {
  let viaDualBesideInstance = _Object$values;
  let viaInstanceBeside = _at(_ref2.y);
  [viaDualBesideInstance, viaInstanceBeside];
}
for (const viaWritten of [{
  w: Object
}]) {
  const viaWrittenKeys = _Object$keys;
  viaWrittenKeys;
}
for (const {
  w: {
    is: viaPrimitiveSlots
  },
  z
} of [{
  w: {
    is: _Object$is
  },
  z: 's'
}, {
  w: {
    is: _Object$is
  },
  z: 2
}]) [viaPrimitiveSlots, z];

// NEGATIVES: an element reading DIFFERENTLY on some pass - another value, another key, a getter, an
// extra slot, a spread, a hole - leaves the head to the generic relocation or native
for (const {
  w: [{
    freeze: viaOtherValue
  }]
} of [{
  w: [Object]
}, {
  w: [userObj]
}]) viaOtherValue;
for (const {
  w: {
    seal: viaOtherKey
  }
} of [{
  w: Object
}, {
  v: Object
}]) viaOtherKey;
for (const {
  w: {
    assign: viaGetter
  }
} of [{
  w: Object
}, {
  get w() {
    return Object;
  }
}]) viaGetter;
for (const {
  w: {
    groupBy: viaExtraSlot
  }
} of [{
  w: {
    groupBy: _Object$groupBy
  },
  z: 1
}, {
  w: {
    groupBy: _Object$groupBy
  },
  z: 2
}]) viaExtraSlot;
for (const {
  w: {
    fromEntries: viaSpread
  }
} of [{
  w: Object
}, {
  w: Object,
  ...more
}]) viaSpread;
for (const [{
  getOwnPropertyNames: viaHole
}] of [[Object], [, Object]]) viaHole;
// ... and a pattern written further down the body reads the loop variable as a plain binding
for (const viaLater of [{
  w: Object
}]) {
  const z = 1;
  const viaLaterKeys = _keys(viaLater.w);
  [z, viaLaterKeys];
}

// an emptied SOLE host with a pure init leaves on both legs, the wrapper husk included; a neighbour
// element that runs lifts as a statement ahead, in source order (the `push` claims are carriers)
let viaEmptiedObject = _entries(rec.w);
let viaEmptiedObjectAt = _at(rec.y);
[viaEmptiedObject, viaEmptiedObjectAt];
const viaEmptiedWrap = _values(rec.w);
const viaEmptiedWrapAt = _at(rec.y);
[viaEmptiedWrap, viaEmptiedWrapAt];
_pushMaybeArray(log).call(log, 'n');
const viaEmptiedEffect = _keys(rec.w);
const viaEmptiedEffectAt = _at(rec.y);
[viaEmptiedEffect, viaEmptiedEffectAt];
_pushMaybeArray(log).call(log, 'l');
const viaEmptiedLead = _entries(rec.w);
const viaEmptiedLeadAt = _at(rec.y);
[viaEmptiedLead, viaEmptiedLeadAt];
// ... and ahead of the STATICS the host extracted earlier: the source ran the element first
const known = {
  w: Object,
  y: [1]
};
_pushMaybeArray(log).call(log, 's');
const viaEmptiedStatic = _Object$is;
const viaEmptiedStaticAt = _atMaybeArray(known.y);
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedObject, viaEmptiedWrap, viaEmptiedEffect, viaEmptiedLead, viaEmptiedStatic };