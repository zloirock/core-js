class Holder<T = string> { get(): T { return null as any; } }
declare const defaulted: Holder;
defaulted.get().at(0);
