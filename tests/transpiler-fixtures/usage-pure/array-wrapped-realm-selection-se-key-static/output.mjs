import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A realm selection in an array wrapper collapses to the one realm it names before any route reads
// it: the claims beside an effectful key then take the receiver mirror, as the plain realm does -
// no array capture reads the constructor off the bare realm slot.
const [{
  Array: {
    [(_pushMaybeArray(log).call(log, 'k'), 'of')]: a,
    from: b
  }
}] = [{
  Array: {
    of: _Array$of,
    from: _Array$from
  }
}];
const [{
  Array: {
    [(_pushMaybeArray(log).call(log, 'k'), 'of')]: c = 1,
    from: d
  }
}] = [_globalThis.window ? null == _globalThis.window ? _globalThis.window : {
  Array: {
    of: _Array$of,
    from: _Array$from
  }
} : {
  Array: {
    of: _Array$of,
    from: _Array$from
  }
}];
use(a, b, c, d);