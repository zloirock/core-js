// `T extends `x${string}` ? Promise<string> : number[]` - template-pattern decidability
// is beyond our resolver, but pre-fix isTemplateLiteralExtend recognised only oxc-shape
// TSTemplateLiteralType; babel-parser shape `TSLiteralType { literal: TemplateLiteral }`
// was missed, so pickConditionalBranch saw both check + extend as $Primitive('string'),
// typesEqual returned true, and trueBranch (Promise<string>) was always selected -
// `.at(0)` resolved to Promise (no .at), no polyfill emitted. with the babel-shape guard
// the conditional bails to undecidable, fold visits both branches, generic `_at` emits
type Wrap<T> = T extends `x${string}` ? Promise<string> : number[];
declare const r: Wrap<'mismatch'>;
r.at(0);
