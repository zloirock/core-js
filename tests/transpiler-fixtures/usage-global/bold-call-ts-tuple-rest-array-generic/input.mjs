declare const tuple: [number, ...Array<string>];
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tuple.at(0).toFixed(2);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tuple.at(1).bold();
