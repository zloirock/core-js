import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Storing a constructor inside a receiver does not hand it to external code. An inline destructuring parameter consumes its
// declared slots without widening the constructor family.
use((C => _nameMaybeFunction(C))(_WeakSet));