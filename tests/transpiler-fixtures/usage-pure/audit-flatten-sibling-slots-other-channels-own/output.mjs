import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Set from "@core-js/pure/actual/set";
// the flatten's sibling walk substitutes proxy-global reads in the declarators it re-emits, but a
// slot another channel replaces WHOLESALE has no room for that transform: the `key in obj` fold,
// and all three receiver slots a synth swap owns - a destructure host's init and right, and an
// IIFE argument the callee destructures in its own param pattern, in every shape that invokes it
// (plain call, optional call, `new`). a computed hop key it cannot
// fold in the DECLARATION scope is not a verdict either: the natural visitor may still claim it
const {
    Array: {
      of
    }
  } = {
    Array: {
      of: _Array$of
    }
  },
  hasMap = true;
const {
    Object: {
      entries
    }
  } = {
    Object: {
      entries: _Object$entries
    }
  },
  fnArg = function ({
    Promise
  }) {
    return Promise;
  }({
    Promise: _Promise
  });
const {
    Object: {
      assign
    }
  } = {
    Object: {
      assign: _Object$assign
    }
  },
  arrowArg = (({
    Map
  }) => Map)({
    Map: _Map
  });
const {
    Promise: {
      allSettled
    }
  } = {
    Promise: {
      allSettled: _Promise$allSettled
    }
  },
  secondArg = function (a, {
    Set
  }) {
    return Set;
  }(1, {
    Set: _Set
  });
const {
    Object: {
      keys
    }
  } = {
    Object: {
      keys: _Object$keys
    }
  },
  optionalArg = function ({
    Set
  }) {
    return Set;
  }?.({
    Set: _Set
  });
const {
    Object: {
      freeze
    }
  } = {
    Object: {
      freeze: _Object$freeze
    }
  },
  constructedArg = new function ({
    Map
  }) {
    this.m = Map;
  }({
    Map: _Map
  });
const {
    Number: {
      isInteger
    }
  } = {
    Number: {
      isInteger: _Number$isInteger
    }
  },
  nested = () => {
    const NAME = 'Promise';
    return _Promise;
  };

// negatives: a plain sibling read and a static off a known constructor keep their substitution,
// and an IIFE whose parameter is not a pattern owns nothing
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  plain = _globalThis;
const {
    Object: {
      values
    }
  } = {
    Object: {
      values: _Object$values
    }
  },
  staticOff = _Object$fromEntries([]);
const {
    Number: {
      isFinite
    }
  } = {
    Number: {
      isFinite: _Number$isFinite
    }
  },
  plainArg = function (g) {
    return g;
  }(_globalThis);
export { of, hasMap, entries, fnArg, assign, arrowArg, allSettled, secondArg, isInteger, nested };
export { keys, optionalArg, freeze, constructedArg };
export { from, plain, values, staticOff, isFinite, plainArg };