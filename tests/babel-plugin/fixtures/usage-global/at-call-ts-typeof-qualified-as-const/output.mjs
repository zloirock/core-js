import "core-js/modules/es.string.at";
const config = {
  name: 'hello'
} as const;
function foo(x: typeof config.name) {
  x.at(-1);
}