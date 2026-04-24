// `MyP` comes from `my-fork/actual/promise` (a user-picked vendor fork, not the
// plugin's default pure package), so `super.try(...)` in the subclass must be
// left alone - the fork's own implementation is preserved rather than rewritten
// to the default Promise.try polyfill
import MyP from 'my-fork/actual/promise';
class C extends MyP {
  static m() { return super.try(() => 1); }
}
