import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.define-getter";
import "core-js/modules/es.object.define-setter";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.lookup-getter";
import "core-js/modules/es.object.lookup-setter";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a BRANCHING computed destructure key (`{ [cond ? "from" : "of"]: v }`) resolves to no single
// dominating key, yet each literal arm is reachable at runtime - usage-global must inject each arm
// keyed to the resolved destructure RECEIVER, exactly like the member-access union `Array[cond ?
// "from" : "of"]`. the receiver was previously dropped to typeless for the two hosts whose init is
// not a plain declarator/assignment read: the array-wrappered element (paired to the array slot)
// and the plain-IIFE caller-arg.
[{
  [flag ? "from" : "of"]: viaArrayWrap
} = {}] = [Array];
(function ({
  [flag ? "assign" : "entries"]: viaIife
}) {})(Object);
({
  [flag ? "fromEntries" : "values"]: viaAssign
} = Object);