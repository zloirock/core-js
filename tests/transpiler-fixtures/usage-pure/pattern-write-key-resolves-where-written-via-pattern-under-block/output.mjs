import _at from "@core-js/pure/actual/instance/at";
const slot = 'k1';
let patternUnderBlock;
{
  const slot = 'k2';
  ({
    [slot]: patternUnderBlock
  } = {
    k1: 'flat',
    k2: 'at'
  });
}
export const viaPatternUnderBlock = list => _at(list).call(list);