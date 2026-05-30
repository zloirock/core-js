// explicit type arguments at a new-site and a call-site reference globals that the call's own
// visitor never reads as runtime refs; distinct globals per line keep each import mappable
declare const Box: new <T>() => T;
declare function take<T>(): T;
new Box<Map<number>>();
take<Set<number>>();
