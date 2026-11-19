// A `delete` through a realm alias and an optional `window` link still reads the globals of its
// navigation: each deleted run detects the global it names, a backed hop and a plain one alike.
const g = globalThis;
const s = self;
delete g.window?.Map.userKey;
delete s.window?.Set.userKey;
delete g.window?.userSlot;
delete g.self?.RegExp.userKey;
delete g.window.WeakMap.userKey;
