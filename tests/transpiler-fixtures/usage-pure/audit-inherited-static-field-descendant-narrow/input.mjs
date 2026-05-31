// a static field declared on the base class is reachable on a descendant (`Derived.items`); its
// initializer type carries through inheritance, so `Derived.items.at()` gets the array-specific
// polyfill. `at` (Array AND String) makes the inherited-field resolution observable - a bail to
// unknown would emit the generic instance `at`. regression lock.
class Base { static items = [1, 2, 3]; }
class Derived extends Base {}
Derived.items.at(0);
