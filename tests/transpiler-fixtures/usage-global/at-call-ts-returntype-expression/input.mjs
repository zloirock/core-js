const getItems = function (): number[] {
  return [1, 2, 3];
};
function foo(x: ReturnType<typeof getItems>) {
  x.at(-1);
}
