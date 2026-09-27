// Combining class method summaries must not turn a static field write into an object escape.
class Base { static create() {} }
class Repo extends Base {
  static items = [1, 2];
  static make() { return Repo.items.at(-1); }
}
Repo.registry = {};
consume(Repo.make());
