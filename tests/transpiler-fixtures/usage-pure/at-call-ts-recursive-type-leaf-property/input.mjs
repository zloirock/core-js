type A = { b: A; label: string };
declare const a: A;
a.b.b.label.at(-1);
