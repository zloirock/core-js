// `delete (x as any).Promise`: the TS cast must be peeled, but the `Promise` operand
// stays verbatim because `delete` operand cannot be polyfill-rewritten.
delete (Map as any).prototype;
delete (obj.at as any);
delete obj.includes!;
