import "core-js/modules/es.array.at";
const inner = {
  items: [1, 2, 3]
};
const config = inner;
function foo(x: typeof config.items) {
  x.at(-1);
}