type T = string[] | Extract<number, boolean>;
declare const x: T;
x.at(0);
