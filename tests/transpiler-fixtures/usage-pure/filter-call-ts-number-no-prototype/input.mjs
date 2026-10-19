declare const x: number;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
x.filter(y => y > 0);
