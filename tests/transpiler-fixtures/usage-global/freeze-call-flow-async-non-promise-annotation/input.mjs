async function foo(): string {
  return 'hello';
}
function bar() {
  Object.freeze(foo());
}
