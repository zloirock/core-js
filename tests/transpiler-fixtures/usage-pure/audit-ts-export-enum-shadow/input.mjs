// `export enum / export const enum / export namespace X {}` wraps the runtime declaration
// inside a named-export node - the body scan unwraps the export so the shadow is
// detected. without unwrap, the wrapping named-export node was inspected directly and the
// runtime declaration's id was missed
export enum Map { A = 1 }
export const a = new Map();
