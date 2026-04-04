type Config = {
  items: string[];
};

function foo(c: Config) {
  c.items.at(-1);
}
