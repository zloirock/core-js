// @flow
// A spread argument supplies the rest element type before the generic default.
declare class C { m<T = number[]>(...xs: T[]): T }
new C().m(...["abc"]).at(0);
