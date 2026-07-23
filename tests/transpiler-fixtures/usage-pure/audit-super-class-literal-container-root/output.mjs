import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the pure sibling of the usage-global fixture: here the receiver is SUBSTITUTED when the alias
// resolves, so both directions are observable. a literal container binds the global as its slot
// VALUE and must substitute; the negatives must stay native - a key read OFF the global is not the
// global, a non-global container carries no global, and an ambiguous union / defaulted / spread-
// shifted slot has no single definite value. distinct method per line.
const [arrayWrap] = [_globalThis];
const {
  slot: objectWrap
} = {
  slot: _globalThis
};
const {
  keyRead
} = _globalThis;
const [nonGlobal] = [somethingElse];
const [unionWrap] = cond ? [_globalThis] : [somethingElse];
const [defaulted = somethingElse] = [];
export class ViaArray extends _Promise {
  static m() {
    return _Promise$any.call(this, []);
  }
}
export class ViaObject extends _Promise {
  static m() {
    return _Promise$allSettled.call(this, []);
  }
}
export class BailKeyRead extends keyRead.Promise {
  static m() {
    return super.race([]);
  }
}
export class BailNonGlobal extends nonGlobal.Promise {
  static m() {
    return super.reject();
  }
}
export class BailUnion extends unionWrap.Promise {
  static m() {
    return super.resolve();
  }
}
export class BailDefault extends defaulted.Promise {
  static m() {
    return super.all([]);
  }
}