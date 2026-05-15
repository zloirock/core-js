// merged namespace + class declared inside a function body (not module-level).
// scope walk traverses up through the function's BlockStatement -> the merged
// namespace is found at the function's scope. mirrors module-level behaviour
function makeIt() {
  class Local {}
  namespace Local {
    export function build(): Local {
      return new Local();
    }
  }
  Local.build().at(0);
}
makeIt();
