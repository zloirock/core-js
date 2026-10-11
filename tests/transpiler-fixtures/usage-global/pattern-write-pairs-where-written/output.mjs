import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-sorted";
// In usage-global a pattern write pairs its slot where the write stands: the key a block around the
// read rebinds still pairs the outer slot, `findLastIndex`, and the one a block around the write
// rebinds pairs the block's, `toSorted` - read where the call stands, the pairing swaps and injects
// `copyWithin` and `fill` instead
const slot = 'k1';
let paired;
({
  [slot]: paired
} = {
  k1: 'findLastIndex',
  k2: 'copyWithin'
});
let viaReadBlock;
{
  const slot = 'k2';
  viaReadBlock = (list, fn) => list[paired](fn);
}
export { viaReadBlock };
let underBlock;
{
  const slot = 'k2';
  ({
    [slot]: underBlock
  } = {
    k1: 'fill',
    k2: 'toSorted'
  });
}
export const viaWriteBlock = list => list[underBlock]();