// A member alias keeps the nested object it captured before receiving an opaque value.
// Its earlier write replaces the original constructor: neither flavor needs Array.from
// or its dependencies, and the custom method stays intact.
function run(external) {
  const original = {
    slot: {
      x: Array
    }
  };
  let alias = original.slot;
  alias.x = {
    from: () => 'custom member'
  };
  alias = external();
  return original.slot.x.from([1]);
}
run(() => ({}));