// namespace declared BEFORE the class - declaration order doesn't matter, scope walk
// finds the merged namespace regardless. resolver narrows `Container.build()` to
// user's Container instance type, so `.at(0)` doesn't get a polyfill
namespace Container {
  export function build(): Container {
    return new Container();
  }
}
class Container {}

const c = Container.build();
c.at(0);
