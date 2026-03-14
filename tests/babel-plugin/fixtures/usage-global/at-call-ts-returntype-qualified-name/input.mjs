const utils = {
  getName(): string {
    return 'hello';
  }
};
function foo(x: ReturnType<typeof utils.getName>) {
  x.at(-1);
}
