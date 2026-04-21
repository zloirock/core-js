import _isIterable from "@core-js/pure/actual/is-iterable";
// OptionalMemberExpression for Symbol?.iterator. asSymbolRef + resolveKey must both treat
// Optional- variants identically. `asSymbolRef` expects left.type = MemberExpression OR
// OptionalMemberExpression and both branches are listed in handleBinaryIn
_isIterable(obj);