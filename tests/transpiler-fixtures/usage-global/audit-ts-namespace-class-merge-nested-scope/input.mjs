// Class + merged namespace declared inside a function body rather than at module
// scope. `Local.build()` inside the function must still resolve via the local
// namespace and narrow to the user's class instance, so `.at(0)` on the result
// must NOT emit Array#at - declaration-merging behaves the same in nested scopes.
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
