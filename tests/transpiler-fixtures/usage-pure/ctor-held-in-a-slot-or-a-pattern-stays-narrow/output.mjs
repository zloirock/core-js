import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _SuppressedError from "@core-js/pure/actual/suppressed-error";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a constructor a value position STORES rather than hands out: a write puts it inside the receiver,
// and an argument landing in a destructuring parameter of a callee spelled inline binds the slots the
// pattern names. neither leaves the file, so the census answers the CHANNEL, never the position that
// raised it. what the two FLAVORS then owe parts company on the slot write: the flavor that patches
// the one global slot still finds the value there and keeps the bare entry, while the flavor minting
// a BINDING reads its statics off what it minted and is owed the family - the pattern rows are narrow
// for both. each row names its own global, or one row's family would answer for another's here
const held = {
  k: Object
};
held.k = _Map;
use(new held.k());
// ... and the same write once the container itself leaves: through a call, through an export, or
// into a receiver this census cannot name at all - the value is reachable wherever the container is
const passed = {
  k: Object
};
passed.k = _Promise;
hand(passed);
const exported = {
  k: Object
};
exported.k = _URL;
export { exported };
sink.slot = _AggregateError;
// a write nothing ever reads back is owed by neither flavor - nothing can observe the statics of a
// value stored where the file never looks again
const unread = {
  k: Object
};
unread.k = _WeakMap;
use(1);
// the pattern channel, and the shadowing parameter that raised it - what the census answers for is
// the pairing, not the name
use((({
  name
}) => name)({
  name: _nameMaybeFunction(_Iterator)
}));
use(function ({
  name
}, Symbol) {
  return name;
}(_Symbol));
// ... and the three spellings that read PAST the pairing: an IDENTIFIER parameter holds the value
// whole, a key the pattern cannot name reads a slot nothing here names, and a REST element takes
// every own property in one binding.
// what holding it WHOLE costs is decided by how the body reads it: through MEMBERS only, the file
// names every static it takes off the binding and the narrow entry still answers; the negative right
// below reads the same parameter BARE, which hands the constructor to a consumer that can read any
// static off it - on another global, or its family would swallow the evidence above
use((C => _nameMaybeFunction(C))(_WeakSet));
use((C => hand(C))(_Set));
// ... and the callee that hands the value straight back holds nothing at all: the call IS the
// argument, so the reference stays this file's own wherever the call itself does not leave
const identity = x => x;
use(_Number$isInteger);
use((({
  [pick()]: got
}) => got)(WeakRef));
use((({
  name,
  ...rest
}) => rest)(_SuppressedError));