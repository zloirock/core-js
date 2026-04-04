interface Config {
  getItems(): string[];
}

function foo(c: Config) {
  c.getItems().at(-1);
}
