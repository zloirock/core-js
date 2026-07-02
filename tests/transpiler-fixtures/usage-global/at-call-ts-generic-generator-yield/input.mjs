function* items<T>(arr: T[]): Generator<T> {
  for (const item of arr) yield item;
}
for (const item of items(['hello'])) {
  item.at(0);
}
