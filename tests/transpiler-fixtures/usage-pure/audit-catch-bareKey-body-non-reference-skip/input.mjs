// catch destructure body-usage check must filter Identifiers in non-reference slots
// (method/property names, member-access tails). pre-fix `walkAstNodes` counted any
// matching-name Identifier as a reference, so the catch transform fired even when
// the binding was unused (`class C { includes() {} }` body had `.includes` method-name
// matching the binding, but it's not a runtime reference). post-fix `isNonReferencePosition`
// filter rejects those slots; bare-key catch destructure with no real binding ref stays
// untouched. real reference (third try) still drives the polyfill emit
try {} catch ({ includes }) { class C { includes() {} } }
