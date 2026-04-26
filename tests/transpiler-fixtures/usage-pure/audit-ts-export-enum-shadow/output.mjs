// `export enum / export const enum / export namespace X {}` wraps the runtime declaration
// in `ExportNamedDeclaration.declaration` - the body scan unwraps the export so the shadow
// is detected. without unwrap, the wrapping ExportNamedDeclaration was inspected directly
// and the runtime declaration's id was missed
export enum Map {
  A = 1,
}
export const a = new Map();