import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
const slot = 'k1';
let paired;
({
  [slot]: paired
} = {
  k1: 'flat',
  k2: 'at'
});
let viaPatternKey;
{
  const slot = 'k2';
  viaPatternKey = list => _flatMaybeArray(list).call(list);
}
export { viaPatternKey };