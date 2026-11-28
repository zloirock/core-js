// An explicit string overrides an array default.
declare function makeExplicit<T = number[]>(): T;
makeExplicit<string>().at(0);
