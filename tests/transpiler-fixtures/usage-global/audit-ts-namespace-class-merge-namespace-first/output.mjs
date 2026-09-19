// Declaration order doesn't matter for declaration merging: `namespace Container`
// is declared BEFORE `class Container`, but `Container.build()` must still
// resolve via the merged namespace and narrow to the user's class instance.
// `.at(0)` on the result must NOT emit Array#at or String#at.
namespace Container {
  export function build(): Container {
    return new Container();
  }
}
class Container {}
const c = Container.build();
c.at(0);