const utils = {
  getName: (): string => 'hello'
};
function foo(x: ReturnType<typeof utils.getName>) {
  x.at(-1);
}
