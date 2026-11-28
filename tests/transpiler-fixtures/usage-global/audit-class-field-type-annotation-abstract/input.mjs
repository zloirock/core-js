// Only the annotations name these collections. Neither abstract member has an initializer.
abstract class C<T> {
  abstract bag: Map<string, T>;
  abstract accessor cache: Set<T>;
}
export { C };
