// a nested leaf under a hop whose computed key runs an effect keeps its pattern: the effect runs where the source
// wrote it, and the claim beneath stays native rather than reading off a twin that would drop the key
function rows(box, touch) {
  const { [(touch(), 'y')]: { other: { q }, at } } = box;
  const { k, [(touch(), 'z')]: { more: { r }, flat } } = box;
  return [q, at, k, r, flat];
}
use(rows);
