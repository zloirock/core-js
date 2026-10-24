// the optional slot-delete records `globalThis.Promise` as a ctor-slot mutation: the
// receiver routes, the dropped `?.` is sound (the routed object is always defined) and the
// constructor's own entry is pinned up front so core-js initializes from the pristine global
delete globalThis
  ?.Promise;
