import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A discarded accessor receiver read runs once before its pure static is bound.
// An inert getter and a plain realm require no effect replay.
let reads = 0;
const holder = {
  get g() {
    reads++;
    return _globalThis;
  }
};
const {
  Object: {
    keys: {
      bind
    }
  }
} = (holder.g, {
  Object: {
    keys: _Object$keys
  }
});
export const descended = [typeof bind, reads];
const armed = {
  get g() {
    reads++;
    return _globalThis;
  }
};
const {
  Array: {
    from
  }
} = (armed.g, {
  Array: {
    from: _Array$from
  }
});
export const served = [typeof from, reads];
const inert = {
  get g() {
    return _globalThis;
  }
};
const {
  Object: {
    keys: inertKeys
  }
} = {
  Object: {
    keys: _Object$keys
  }
};
export const withoutEffect = typeof inertKeys;
const {
  Object: {
    keys: {
      bind: realmBind
    }
  }
} = {
  Object: {
    keys: _Object$keys
  }
};
export const fromRealm = typeof realmBind;
const assigned = {
  get g() {
    reads++;
    return _globalThis;
  }
};
let assignedBind;
({
  Object: {
    keys: {
      bind: assignedBind
    }
  }
} = (assigned.g, {
  Object: {
    keys: _Object$keys
  }
}));
export const viaAssignment = [typeof assignedBind, reads];