import "core-js/modules/es.string.at";
const greeting: string = 'hello';
function foo(x: typeof greeting) {
  x.at(-1);
}