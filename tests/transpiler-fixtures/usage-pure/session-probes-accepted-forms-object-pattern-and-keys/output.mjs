// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
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
    w: eff() && Object,
    q: 1
  };
  [andHop, andQ];
}