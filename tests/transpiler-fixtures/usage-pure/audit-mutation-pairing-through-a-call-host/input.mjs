// the pairing has to name the function a call binds, and not every call-like host spells that name
// the way a plain callee does: a `new` names the CLASS while the method it runs is keyed
// `constructor`, an immediately-invoked literal names nothing at all, a tag hands its strings array
// the first slot, and `super` names the base through the `extends` clause. each row's write reaches
// its constructor only through that naming, so a row that keeps the standalone ponyfill lost it
class Installer {
  constructor(target) {
    target.groupBy = patched;
  }
}
new Installer(Map);
Map.groupBy(src, it => it);

(function (target) {
  target.allSettled = patched;
})(Promise);
Promise.allSettled(src);

function tag(strings, target) {
  target.from = patched;
}
tag`${ Array }`;
Array.from(src);

class Base {
  constructor(target) {
    target.groupBy = patched;
  }
}
class Derived extends Base {
  constructor() {
    super(Object);
  }
}
new Derived();
Object.groupBy(src, it => it);
