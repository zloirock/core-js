// Direct eval stays in the source scope after the single keyed read.
export function read(factory, key) {
  const local = 11;
  const { [(key(), 'at')]: method = eval('local'), after } = factory();
  return [method, after, local];
}
