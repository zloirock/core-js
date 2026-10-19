// Class + merged namespace declared inside a function body rather than at module
// scope. `Local.build()` inside the function must still resolve via the local
// namespace and narrow to the user's class instance, so `.at(0)` on the result
// must NOT emit Array#at - declaration-merging behaves the same in nested scopes.
function makeIt() {
  class Local {}
  // @ts-expect-error a namespace below the top level is the shape under test
  namespace Local {
    export function build(): Local {
      return new Local();
    }
  }
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  Local.build().at(0);
}
makeIt();
