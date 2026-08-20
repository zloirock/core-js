import "core-js/modules/es.string.at";
const config = {
  name: 'hello'
};
function foo(x: typeof config.name) {
  x.at(-1);
}