// Awaited<NoInfer<Promise<X>>>: NoInfer is a structure-preserving wrapper that
// hides Promise from the awaited resolver. must peel before Promise unwrap so
// the awaited inner surfaces correctly
declare const p: Awaited<NoInfer<Promise<number[]>>>;
p.includes(1);
