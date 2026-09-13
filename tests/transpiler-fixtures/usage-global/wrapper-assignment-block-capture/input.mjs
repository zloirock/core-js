// A literal assigned in a block captures that block's local alias. The assigned holder
// remains the outer binding, so its nested write reaches the original container.
const original = { x: Array };
let alias = { x: Object };
{
  const local = original;
  alias = { box: local };
  alias.box.x = { from: () => 'custom' };
}
original.x.from([1]);
