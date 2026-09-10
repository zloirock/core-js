// a constructor a value position STORES rather than hands out: a write puts it inside the receiver,
// and an argument landing in a destructuring parameter of a callee spelled inline binds the slots the
// pattern names. neither leaves the file, so the census answers the CHANNEL, never the position that
// raised it. what the two FLAVORS then owe parts company on the slot write: the flavor that patches
// the one global slot still finds the value there and keeps the bare entry, while the flavor minting
// a BINDING reads its statics off what it minted and is owed the family - the pattern rows are narrow
// for both. each row names its own global, or one row's family would answer for another's here
const held = { k: Object };
held.k = Map;
use(new held.k());
// ... and the same write once the container itself leaves: through a call, through an export, or
// into a receiver this census cannot name at all - the value is reachable wherever the container is
const passed = { k: Object };
passed.k = Promise;
hand(passed);
const exported = { k: Object };
exported.k = URL;
export { exported };
sink.slot = AggregateError;
// a write nothing ever reads back is owed by neither flavor - nothing can observe the statics of a
// value stored where the file never looks again
const unread = { k: Object };
unread.k = Array;
use(1);
// the pattern channel, and the shadowing parameter that raised it - what the census answers for is
// the pairing, not the name
use((({ name }) => name)(Iterator));
use(function ({ name }, Symbol) { return name; }(globalThis.Symbol));
// ... and the three spellings that read PAST the pairing: an IDENTIFIER parameter holds the value
// whole, a key the pattern cannot name reads a slot nothing here names, and a REST element takes
// every own property in one binding
use(((C) => C.name)(WeakSet));
// ... and the callee that hands the value straight back holds nothing at all: the call IS the
// argument, so the reference stays this file's own wherever the call itself does not leave
const identity = x => x;
use(identity(Number).isInteger);
use((({ [pick()]: got }) => got)(Reflect));
use((({ name, ...rest }) => rest)(SuppressedError));
