// a class getter declares its return on the node (babel) but nested on `value.returnType` (oxc/ESTree, a
// TSEmptyBodyFunctionExpression). the type-member reader must read the getter RETURN, not the function value,
// so a 2-hop chain off the getter (`s.bucket.items`) narrows identically on both parsers. previously the bare
// `?? m.value` read the function on oxc -> unplugin lost the narrow past the getter (generic) while babel
// narrowed - a parser-asymmetric import-set divergence
interface Bucket {
  items: number[];
  label: string;
}
declare class Store {
  get bucket(): Bucket;
}
declare const s: Store;
s.bucket.items.at(-1);
s.bucket.label.includes("x");
