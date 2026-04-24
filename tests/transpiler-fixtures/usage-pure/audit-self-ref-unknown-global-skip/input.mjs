// `var Foo = Foo` - pattern matches the self-ref guard shape but `isKnownGlobalName`
// check filters out user-owned capitalised names. avoids over-injection for arbitrary
// user aliases that coincidentally share a shim-style form
var MyThing = MyThing;
new MyThing();
