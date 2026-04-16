function first<const T extends readonly unknown[]>(xs: T) {
  return xs.at(0);
}
first(['a', 'b', 'c']);
