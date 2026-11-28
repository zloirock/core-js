class Container<T> {
  bag!: Map<string, T>;
  accessor cache!: Set<T>;
}
new Container<number>();
