const fn = (): string => '';
declare const x: typeof fn;
x().at(0);
