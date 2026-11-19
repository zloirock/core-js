// A computed hop evaluates its key once before capturing the nested receiver.
// Native siblings and polyfilled method reads then follow in their original order.
function rows(box, touch) {
  const { [(touch(), 'y')]: { other: { q }, at } } = box;
  const { k, [(touch(), 'z')]: { more: { r }, flat } } = box;
  return [q, at, k, r, flat];
}
use(rows);
