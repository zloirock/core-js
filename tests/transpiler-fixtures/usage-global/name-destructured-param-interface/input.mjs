interface Config {
  name: string;
  count: number;
}

function process({ name }: Config) {
  name.at(0);
}
