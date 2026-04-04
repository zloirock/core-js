const str = 'hello';
function foo(name: typeof str) {
  name.at(-1);
}
