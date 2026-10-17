import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A constructor stored in a container carries its statics for reads the transform cannot replace.
// The obligation follows the stored value through named properties and array slots.
const shorthand = {
  Map: _Map
};
const viaShorthand = _Map$groupBy;
const {
  Map: _unused,
  ...shorthandRest
} = shorthand;
const renamed = {
  M: _Map
};
const viaRenamed = _Map$groupBy;
const {
  M: _unused2,
  ...renamedRest
} = renamed;
const indexed = [_Map];
const [_ref] = indexed,
  {
    groupBy: viaIndex,
    ...indexRest
  } = _Map;
// ... and a SELECTION between values reaches every arm, so a container standing as one arm owes the
// same entry - the arm a run takes is not the census's to decide
const selected = {
  Map: _Map
};
const {
  Map: {
    groupBy: viaSelection
  },
  ...selectionRest
} = _globalThis.window ?? selected;
// ... and the two negatives keep the narrow entry. A slot the pattern merely REACHES through stores
// nothing - a getter hands back the realm, and the realm's own binding answers its statics - and a
// key that names no static of the stored constructor asks nothing of the entry either
const reached = {
  get realm() {
    return _globalThis;
  }
};
const {
  realm: {
    Map: {
      groupBy: viaGetter
    }
  }
} = {
  realm: {
    Map: {
      groupBy: _Map$groupBy
    }
  }
};
const custom = {
  Set: _Set
};
const {
  Set: {
    customZ: viaCustomKey
  },
  ...customRest
} = custom;
export { viaShorthand, viaRenamed, viaIndex, viaSelection, viaGetter, viaCustomKey };
export { shorthandRest, renamedRest, indexRest, selectionRest, customRest };