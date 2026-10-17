import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
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