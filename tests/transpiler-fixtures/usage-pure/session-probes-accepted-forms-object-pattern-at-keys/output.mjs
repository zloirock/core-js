// Separate call-valued literal slots keep their native at and keys reads and sibling bindings.
const k = 'k';
function eff() {
  return Object;
}
{
  const {
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  };
  const {
    w: {
      keys: k
    },
    q
  } = {
    w: eff(),
    q: 1
  };
  use(m, z, k, q);
}