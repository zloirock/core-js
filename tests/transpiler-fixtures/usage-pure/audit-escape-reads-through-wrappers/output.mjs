import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// the ESCAPE analysis reads through a paren on both sides of every identity it takes: an alias
// assignment behind one still binds the value to a single name, so the narrow holds, while a
// reference a paren hands into an object literal still LEAKS, so the narrow must go
const arr = [3, [1, 2]];
const plainHolder = {
  y: arr
};
let aliasHost;
aliasHost = plainHolder;
const viaParenAlias = _atMaybeArray(aliasHost.y);
const leaked = {
  y: arr
};
const leakHost = {
  slot: leaked
};
const viaParenLeak = _at(leaked.y); // ... but a SEQUENCE is NOT such a wrapper: its prefix is an effect the receiver does not spell, so
// the residual stays and performs it where the source wrote it
let out;
const {
  y: {
    at: viaSeqPrefix
  }
} = (out = 4, {
  y: _flatMaybeArray(arr).call(arr)
});
export { viaParenAlias, leakHost, viaParenLeak, viaSeqPrefix, out };