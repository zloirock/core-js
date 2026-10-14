// A binding a TS assertion wraps whole is written as spelled, like its member twin, in both emitters - alone,
// beside a sibling, beside a rest, one level down, beside a nested rest, in a for-of head, over a default and
// as an instance claim's target, and under a level whose assignment yields its value.
let a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, j: any, k: any, m: any, x: any, rest: any;
declare const arr: any[];
({ trunc: (a as any) } = Math);
({ of: b!, custom: c } = Array);
({ fromAsync: (d satisfies any), ...rest } = Array);
({ Object: { values: (e as any) } } = globalThis);
({ Object: { entries: f!, ...rest } } = globalThis);
for ({ fromEntries: (g as any) } of [Object]);
({ groupBy: (h as any) = fallback } = Object);
({ at: (j as any), custom: c } = arr);
x = ({ includes: (k as any) } = arr);
x = ({ Object: { hasOwn: (m as any) } } = globalThis);
