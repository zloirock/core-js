import _Object$keys from "@core-js/pure/actual/object/keys";
// A quiet object-returning call allows the following static to be extracted.
// The supported indirect-call static route serves Object.keys.
function eff() {
  return Object;
}
{
  const {
    w: {
      keys: andHop
    },
    q: andQ
  } = {
    w: {
      keys: _Object$keys
    } && {
      keys: _Object$keys
    },
    q: 1
  };
  [andHop, andQ];
}
export function read() {
  let calls = 0;
  function owner() {
    calls++;
    return Object;
  }
  const {
    w: {
      keys
    },
    q
  } = {
    w: (owner(), {
      keys: _Object$keys
    }) && {
      keys: _Object$keys
    },
    q: calls
  };
  return [keys({
    a: true
  }), q, calls];
}