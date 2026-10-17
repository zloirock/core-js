import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _self from "@core-js/pure/actual/self";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a nested claim off the realm whose init runs a prefix first - a store into a member, which may
// run a setter, or a sequence element: the prefix rides the dispatch once and the receiver is the
// realm it leaves. re-reading the whole init as the receiver would run the store or the prefix a
// second time. a loop head and a chain of stores carry it the same way
const flat = _flatMaybeArray((o.k = _self, _self.Array.prototype));
const at = _atMaybeString((eff(), _self.String.prototype));
for (const includes = _includesMaybeArray((x = box.k = _self, _self.Array.prototype));;) break;