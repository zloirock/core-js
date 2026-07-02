import "core-js/modules/es.string.at";
const str = 'hello';
function foo(name: typeof str) {
  name.at(-1);
}