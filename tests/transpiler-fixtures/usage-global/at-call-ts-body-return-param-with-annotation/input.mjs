function getData(x: string) {
  return x;
}
// @ts-expect-error the argument crosses the parameter annotation on purpose, which is the shape under test
getData([1, 2, 3]).at(-1);
