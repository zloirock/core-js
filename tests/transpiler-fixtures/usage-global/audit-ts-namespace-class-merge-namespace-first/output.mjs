// Declaration order doesn't matter for declaration merging: `namespace Container`
// is declared BEFORE `class Container`, but `Container.build()` must still
// resolve via the merged namespace and narrow to the user's class instance.
// `.at(0)` on the result must NOT emit Array#at or String#at.
// @ts-expect-error merged declarations tsc refuses are the shape under test
namespace Container {
  export function build(): Container {
    return new Container();
  }
}
class Container {}
const c = Container.build();
// @ts-expect-error the member read is the probe, and the right answer is a type without it
c.at(0);