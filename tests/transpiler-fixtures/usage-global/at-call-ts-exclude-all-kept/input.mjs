type T = Exclude<string | number, boolean>;
declare const x: T;
x.at(0);
