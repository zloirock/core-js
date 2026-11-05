import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// A constructor stored in a container carries statics needed by retained native reads.
// The requirement follows named properties, array slots, selecting branches and getter results.
const shorthand = {
  Map: _Map
};
const {
  Map: {
    groupBy: viaShorthand
  },
  ...shorthandRest
} = shorthand;
const renamed = {
  M: _Map
};
const {
  M: {
    groupBy: viaRenamed
  },
  ...renamedRest
} = renamed;
const indexed = [_Map];
const [{}] = indexed,
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
} = reached;
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