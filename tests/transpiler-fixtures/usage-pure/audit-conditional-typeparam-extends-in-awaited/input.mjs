// conditional under Awaited: `Awaited<T extends U ? Promise<X> : Y>` - the conditional
// branch picker resolves its extends side post-subst. raw `extendsType=U` looks
// unconstrained, but at the call-site U substitutes to a concrete shape and the
// disjoint-inner case must NOT fire the wrong branch
type Pick<T, U> = T extends U ? Promise<string[]> : Promise<number[]>;
declare function probe<T, U>(): Awaited<Pick<T, U>>;
const r = await probe<Array<number>, Array<string>>();
r.at(0);
