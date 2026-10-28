// A guarded realm memo drops only proven hops; user receivers and effectful keys stay native.
const fromRealm = globalThis.window?.self.__dispatchList.includes(2);
const effectful = globalThis.window?.[(key(), 'self')].__dispatchList.at(0);
let held;
const kept = (held = globalThis.window)?.self.__dispatchList.includes(1);
const foreign = user?.self.list.includes(2);
