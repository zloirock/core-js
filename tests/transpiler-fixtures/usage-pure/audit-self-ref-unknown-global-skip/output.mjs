// `var X = X` self-ref shape applied to a user-owned name (not a known global): no
// polyfill should be injected, since `MyThing` has no built-in to fall back to.
var MyThing = MyThing;
new MyThing();