import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
// Literal containers can bind the realm object and resolve the Promise superclass directly.
// A property read from the realm is no container this file spells, so its superclass read stays native.
// A union with the realm takes the polyfill behind an identity check on its realm arm; defaults and
// non-global containers keep their native superclass reads.
// Distinct static methods make every row observable.
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
export class GuardedUnion extends (unionWrap === _globalThis ? _Promise : unionWrap.Promise) {
  static m() {
    return super.resolve();
  }
}
export class BailDefault extends defaulted.Promise {
  static m() {
    return super.all([]);
  }
}