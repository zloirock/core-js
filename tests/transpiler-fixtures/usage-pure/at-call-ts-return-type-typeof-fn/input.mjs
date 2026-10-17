declare function foo(): string[];
declare const x: ReturnType<typeof foo>;
x.at(0);
