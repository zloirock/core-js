import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A captured assignment yields the original realm, while its static leaf receives a polyfill.
// A parameter default serves only its omitted-argument arm; discarded assignments may mirror the receiver.
let of, from;
const {
    Object: {
      fromEntries
    },
    Math: {
      floor
    }
  } = {
    Object: {
      fromEntries: _Object$fromEntries
    },
    Math: _globalThis.Math
  },
  alias = {
    Array: {
      of = _Array$of
    }
  } = _globalThis;
const {
    Reflect: {
      ownKeys
    }
  } = {
    Reflect: {
      ownKeys: _Reflect$ownKeys
    }
  },
  mk = function ({
    Map: {
      groupBy
    }
  } = {
    Map: {
      groupBy: _Map$groupBy
    }
  }) {
    return groupBy;
  };
({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
});
export { of, from, fromEntries, floor, alias, mk };