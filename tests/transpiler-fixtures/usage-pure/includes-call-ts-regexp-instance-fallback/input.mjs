declare const x: RegExp;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
x.includes("test");
