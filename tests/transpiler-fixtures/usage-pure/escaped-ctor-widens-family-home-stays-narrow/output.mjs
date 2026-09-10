import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the boundary the escape decides, on two constructors whose namespace entry DOES add statics: the
// handed-out one owes them (nothing in this file can name what the consumer will read), the one
// only constructed here owes the constructor entry alone. both flavors answer it, through entry
// alphabets of their own - the namespace ponyfill there, the namespace entry's modules here
hand(_Map);
use(new _Promise(r));