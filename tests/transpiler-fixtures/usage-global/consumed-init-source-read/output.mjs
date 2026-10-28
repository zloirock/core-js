import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A consumed receiver still performs its getter read after child claims rewrite the initializer.
// The read and its prefix stay before the extracted binding, including in a bodyless branch.
class Source {
  static get realm() {
    effect();
    return globalThis;
  }
}
const before = begin(),
  {
    from: read
  } = (Array.isArray(effect()), Source.realm.Array),
  after = finish(read);
if (before) var {
  of: other
} = (effect(), Source.realm.Array);
export { read, other, after };