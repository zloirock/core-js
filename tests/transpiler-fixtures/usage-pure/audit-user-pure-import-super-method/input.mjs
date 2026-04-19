// user-named pure import + class extends + super.X - binding `MyPromise` maps back to
// global `Promise` via injector.getPureImport so resolver finds `statics.Promise.try`
import MyPromise from '@core-js/pure/actual/promise';
class C extends MyPromise {
  static m() { return super.try(() => 1); }
}
