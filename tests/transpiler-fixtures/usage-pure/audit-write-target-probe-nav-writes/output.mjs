import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
_globalThis.writeBox = {
  n: 1,
  list: ['ab', 'cd']
};
export function writes() {
  (null == _globalThis.window ? void 0 : _self.writeBox).n = 2;
  (null == _globalThis.window ? void 0 : _self.writeBox).n += 3;
  (null == _globalThis.window ? void 0 : _self.writeBox).n++;
  --(null == _globalThis.window ? void 0 : _self.writeBox).n;
  (null == _globalThis.window ? void 0 : _self.writeBox).n ??= 9;
  [(null == _globalThis.window ? void 0 : _self.writeBox).n] = [5];
  ({
    k: (null == _globalThis.window ? void 0 : _self.writeBox).n
  } = {
    k: 6
  });
  delete ((null == _globalThis.window ? void 0 : _self)?.writeBox).n;
  for ((null == _globalThis.window ? void 0 : _self.writeBox).n of [1]) break;
  return null == _globalThis.window ? void 0 : _self.writeBox.n;
}