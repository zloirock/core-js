import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-x HEAD declares no slot and hosts no statement, so the anchor the declarator and the
// assignment hosts take has nowhere to land: what the head's pattern reads is an ELEMENT of the
// iterated literal, and the MIRROR swaps that element in place - the polyfill then wins on every
// pass, where the source's own read is native and undefined off-engine. Spelled off the bare realm,
// off a CALL the inline canon proves to yield it (the call stays, ahead of the literal, so it still
// runs exactly once per pass), through an ARRAY wrapper, and with a claiming leaf beside the
// pattern. A `for await` head keeps the source on both legs - the awaited value is not the node the
// literal spells - and so does a head over a value no literal pairs.
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
}] of [[{
  Array: {
    of: _Array$of
  }
}]]) wrapped = seen;
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