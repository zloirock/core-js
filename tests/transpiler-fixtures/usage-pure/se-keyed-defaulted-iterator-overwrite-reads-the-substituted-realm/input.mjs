// Each computed key runs before its iterator lookup on the substituted realm.
let it, values;
({ [(eff(), Symbol.iterator)]: it = 1 } = globalThis);
({ [(eff(), Symbol.iterator)]: values = 2 } = self);
