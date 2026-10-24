// `delete (Map as any).prototype` / `delete (obj.at as any)` / `delete obj.includes!`: the TS
// wrappers must be peeled, but the operands stay verbatim because a `delete` operand cannot be
// polyfill-rewritten.
delete (Map as any).prototype;
// @ts-expect-error a delete tsc refuses is the shape under test
delete (obj.at as any);
// @ts-expect-error a delete tsc refuses is the shape under test
delete obj.includes!;
