// a pattern write reads its own names where it stands too: the slot key a block around the reading
// closure rebinds still pairs the outer slot, `flat`, and the one a block around the write rebinds
// pairs that block's, `at`; both arms of a settled write reading an arm-local name the declaration
// does not see leave the key unproven and the read native
const source = 'flat';
const slot = 'k1';
let paired;
({ [slot]: paired } = { k1: 'flat', k2: 'at' });
let viaPatternKey;
{
  const slot = 'k2';
  viaPatternKey = list => list[paired]();
}
export { viaPatternKey };
let patternUnderBlock;
{
  const slot = 'k2';
  ({ [slot]: patternUnderBlock } = { k1: 'flat', k2: 'at' });
}
export const viaPatternUnderBlock = list => list[patternUnderBlock]();
export function viaSettledArms(list, flag) {
  let armKey;
  if (flag) {
    const source = 'at';
    armKey = source;
  } else {
    const source = 'at';
    armKey = source;
  }
  return list[armKey]();
}
