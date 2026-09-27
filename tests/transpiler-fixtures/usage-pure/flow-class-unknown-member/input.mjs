// @flow
// Missing members keep the generic receiver fallback.
declare class C {}
new C().m().at(0);
