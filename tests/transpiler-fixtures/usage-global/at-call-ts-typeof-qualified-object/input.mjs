const config = { items: [1, 2, 3] };
function foo(x: typeof config.items) {
  x.at(-1);
}
