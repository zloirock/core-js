// Storing a constructor inside a receiver does not hand it to external code. An inline destructuring parameter consumes its
// declared slots without widening the constructor family.
use(((C) => C.name)(WeakSet));
