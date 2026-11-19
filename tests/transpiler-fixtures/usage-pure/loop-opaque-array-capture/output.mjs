import _at from "@core-js/pure/actual/instance/at";
// A loop header captures an opaque nested receiver once before its method is read.
// Keep the source call and getter in their original order.
function read(make) {
  for (const [_ref] = [make()], at = _at(_ref.nested);;) return at.call([3, 7], -1);
}
use(read);