import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
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
const [_ref] = indexed,
  {
    groupBy: viaIndex,
    ...indexRest
  } = _Map;
const selected = {
  Map: _Map
};
const {
  Map: {
    groupBy: viaSelection
  },
  ...selectionRest
} = _globalThis.window ?? selected;
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