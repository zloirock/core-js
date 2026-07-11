import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
declare global {
  // alias chain: MyStrings -> Strings -> string[]
  type Strings = string[];
  type MyStrings = Strings;
  // interface field typed as a user alias
  interface Config {
    keys: Strings;
  }
}
function foo(x: MyStrings) {
  x.at(-1).padEnd(5);
}
function bar(c: Config) {
  const {
    keys
  } = c;
  // distinct method from foo's path: the interface-field route owns its own import
  keys.includes('k');
}