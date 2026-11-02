// A BigInt default in a catch pattern remains intact beside an extracted instance method.
try {
  read();
} catch ({ at, limit = 10n }) {
  use(at, limit);
}
