declare global {
  // alias chain: followTypeAliasChain path
  type Strings = string[];
  type MyStrings = Strings;
  // interface: resolveUserDefinedType path
  interface Config {
    keys: Strings;
  }
}

function foo(x: MyStrings) {
  x.at(-1).padEnd(5);
}

function bar(c: Config) {
  const { keys } = c;
  keys.at(-1).padEnd(5);
}
