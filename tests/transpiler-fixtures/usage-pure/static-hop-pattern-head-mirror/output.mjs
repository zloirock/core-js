import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let arity, viaCall, wrapped, beside, besideName, awaited, opaque;
const log = [];
function realm() {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
}
for (const {
  Array: {
    of: {
      length: seen
    }
  }
} of [{
  Array: {
    of: _Array$of
  }
}]) arity = seen;
for (const {
  Array: {
    of: {
      length: seen
    }
  }
} of [(realm(), {
  Array: {
    of: _Array$of
  }
})]) viaCall = seen;
for (const [{
  Array: {
    of: {
      length: seen
    }
  }
}] of [[_globalThis]]) wrapped = seen;
for (const {
  Array: {
    of: {
      length: seen
    },
    from
  }
} of [{
  Array: {
    of: _Array$of,
    from: _Array$from
  }
}]) {
  beside = seen;
  besideName = from;
}
for (const {
  Array: {
    of: {
      length: seen
    }
  }
} of [{
  Array: {
    of: {
      length: 7
    }
  }
}]) opaque = seen;
export async function readAwaited() {
  for await (const {
    Array: {
      of: {
        length: seen
      }
    }
  } of [_globalThis]) awaited = seen;
  return awaited;
}
export { arity, viaCall, wrapped, beside, besideName, opaque, log };