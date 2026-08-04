// @flow
// A callable reached through an indexed access (`declare var f: D['fn']`). Flow keeps a member's
// signature on the property's `value`, so the member lookup hands back the FunctionTypeAnnotation
// itself where TS hands back a method signature - peeling that to its return type gave the caller
// the RESULT where it expected the SIGNATURE, and its own return read then found nothing.
// Distinct methods per arm: Array -> es.array.at, string -> es.string.includes.
type D = {
  rows(): Array<number>,
  label(): string,
};
declare var readRows: D['rows'];
declare var readLabel: D['label'];
readRows().at(0);
readLabel().includes('x');
