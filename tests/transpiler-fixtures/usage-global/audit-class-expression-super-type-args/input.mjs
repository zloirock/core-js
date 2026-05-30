// a class expression's `extends Base<...>` super-type-args reference a global the per-member
// walks never reach; the user base class emits nothing, so the lone import is from the type-arg
class Base<T> {}
const Anon = class extends Base<Set<number>> {};
