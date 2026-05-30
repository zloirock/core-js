// a `var` buried in a nested namespace stays namespace-scoped at every level, so it must not
// suppress the polyfill for the real global used at module scope outside the namespaces
namespace A { namespace B { var Promise: any } }
Promise.resolve(1);
