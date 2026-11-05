import _Object$keys from "@core-js/pure/actual/object/keys";
// A proven call in a selecting object slot remains observable before the keys binding.
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