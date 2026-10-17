// a this-param-ONLY overload takes zero call args - TS routes a one-arg call to the next arm
declare function k(this: Window): number[];
declare function k(x: string): string;