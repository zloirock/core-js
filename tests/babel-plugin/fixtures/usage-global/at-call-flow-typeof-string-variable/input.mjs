const greeting: string = 'hello';
function foo(x: typeof greeting) {
  x.at(-1);
}
