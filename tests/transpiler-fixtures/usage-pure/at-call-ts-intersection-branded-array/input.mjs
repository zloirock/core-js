type SafeArr = string[] & { __brand: "safe" };
declare const x: SafeArr;
x.at(-1);
