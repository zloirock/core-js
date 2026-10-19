type Named = { name: string };
// @ts-expect-error a computed key tsc refuses is the shape under test
declare const entry: Named[string];
entry.at(0);
