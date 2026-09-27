import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Combining class method summaries must not turn a static field write into an object escape.
class Base {
  static create() {}
}
class Repo extends Base {
  static items = [1, 2];
  static make() {
    var _ref;
    return _atMaybeArray(_ref = Repo.items).call(_ref, -1);
  }
}
Repo.registry = {};
consume(Repo.make());