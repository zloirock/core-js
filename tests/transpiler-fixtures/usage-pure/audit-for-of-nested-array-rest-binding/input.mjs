// A rest binding nested below the top level of a for-of array destructure (`[[...rest]]`) is
// always an Array, independent of the iterable element type - it must not inherit the element type
declare const items: string[][];
for (const [[...rest]] of items) {
  rest.at(0);
}
