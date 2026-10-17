const slot = 'k1';
let paired;
({ [slot]: paired } = { k1: 'flat', k2: 'at' });
let viaPatternKey;
{
  const slot = 'k2';
  viaPatternKey = list => list[paired]();
}
export { viaPatternKey };
