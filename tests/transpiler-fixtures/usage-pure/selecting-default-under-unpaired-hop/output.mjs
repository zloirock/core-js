import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// the level above the default pairs nothing in the host's literal - absent under an empty default of
// its own, absent outright (a native throw ahead of the default), or behind a spread - so the default's
// own walk answers alone and both legs mirror it through the shared plan
const {
  k: {
    m: {
      Map: {
        groupBy: a
      }
    } = {
      Map: {
        groupBy: _Map$groupBy
      }
    }
  } = {}
} = {};
let b;
({
  w: {
    k: {
      Object: {
        fromEntries: b
      }
    } = {
      Object: {
        fromEntries: _Object$fromEntries
      }
    }
  }
} = {});
const {
  k: {
    m: {
      Promise: {
        withResolvers: c
      }
    } = user ?? {
      Promise: {
        withResolvers: _Promise$withResolvers
      }
    }
  }
} = {
  k: {},
  ...other
};
const {
  k: {
    m: {
      Array: {
        from: d
      }
    } = {
      Array: {
        from: _Array$from
      }
    }
  } = {}
} = {};
export { a, b, c, d };