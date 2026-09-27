// @flow
// Type queries of ambient static fields preserve their declared value type.
declare class C { static items: string }
function f(x: typeof C.items) { x.at(0); }
