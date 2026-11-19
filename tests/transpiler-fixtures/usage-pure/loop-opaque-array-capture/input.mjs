// A loop header captures an opaque nested receiver once before its method is read.
// Keep the source call and getter in their original order.
function read(make) {
  for (const [{ nested: { at } }] = [make()];;) return at.call([3, 7], -1);
}
use(read);
