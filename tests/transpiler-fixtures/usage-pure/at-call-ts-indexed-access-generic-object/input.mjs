// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
function g<T extends object>(obj: T): T['key'] {
  return (obj as any).key;
}
const arr = g({ key: [1, 2, 3] });
arr.at(0);
