// https://github.com/tc39/proposal-iterator-includes

interface Iterator<T> {
  /**
   * Determines whether the iterator contains a specific element, using SameValueZero comparison.
   * @param searchElement - The element to search for.
   * @param skippedElements - Number of elements to skip before beginning the search. Defaults to 0.
   */
  includes(searchElement: T, skippedElements?: number): boolean;
}
