function g<T extends object>(obj: T): T['key'] {
  return (obj as any).key;
}
const arr = g({ key: [1, 2, 3] });
arr.at(0);
