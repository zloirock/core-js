function getName(): string {
  return 'hello';
}
function foo(x: ReturnType<typeof getName>) {
  x.at(-1);
}
