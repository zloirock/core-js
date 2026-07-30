// The positive control: a genuine iterator-helper call on a receiver the plugin cannot type, so it
// SHOULD pull in `es.iterator.filter`. Kept in its own module so the fields fixture can assert "no
// iterator polyfills at all" - without this, a silent detector would look identical to a correct one.
export function genuineIteratorUse(unknownIterator) {
  return unknownIterator.filter(x => x > 1);
}
