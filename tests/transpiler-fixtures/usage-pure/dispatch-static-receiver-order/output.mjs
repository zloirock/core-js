import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Number$MIN_SAFE_INTEGER from "@core-js/pure/actual/number/min-safe-integer";
// Static values retain receiver and key effects before lookup and arguments.
const direct = (_toFixedMaybeNumber((source(), key(), _Number$MAX_SAFE_INTEGER)) || 0).call(_Number$MAX_SAFE_INTEGER, argument());
const optional = (source(), key(), _Number$MIN_SAFE_INTEGER).toPrecision(argument());
const nested = (before(), object(), ctor(), key(), _Number$MAX_SAFE_INTEGER).toString();
const read = (readBefore(), readKey(), _toFixedMaybeNumber(_Number$MAX_SAFE_INTEGER));