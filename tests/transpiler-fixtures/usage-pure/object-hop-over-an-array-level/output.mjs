import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Object hops pair by property key and array levels pair by position.
// Calls and tagged calls keep their effects once while each static receives its pure value.
const log = [];
const mk = () => {
  _pushMaybeArray(log).call(log, 'mk');
  return Array;
};
function tag() {
  _pushMaybeArray(log).call(log, 'tag');
  return Array;
}
const {
  c: [{
    of: viaCall,
    from: alsoViaCall
  }]
} = {
  c: [(mk(), {
    of: _Array$of,
    from: _Array$from
  })]
};
const {
  c: [{
    of: viaTag
  }]
} = {
  c: [(tag`x`, {
    of: _Array$of
  })]
};
const {
  c: [{
    from: viaBare
  }]
} = {
  c: [{
    from: _Array$from
  }]
};
const {
  a: {
    c: [{
      of: twoHops
    }]
  }
} = {
  a: {
    c: [(mk(), {
      of: _Array$of
    })]
  }
};
export { viaCall, alsoViaCall, viaTag, viaBare, twoHops, log };