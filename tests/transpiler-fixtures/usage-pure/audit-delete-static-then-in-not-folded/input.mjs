// `delete Array.from` mutates the Array.from static file-wide, so a later `'from' in Array` must NOT
// fold to `true`: the deleted property is absent at runtime, so the in-check stays native and yields
// false. an ASSIGN mutation (`Object.fromEntries = ...`) likewise records the static, so
// `'fromEntries' in Object` stays native too - the runtime value is `true` there, so the bail is an
// over-bail that keeps the CORRECT result. a DIFFERENT, unmutated static (`'of' in Array`) still folds
// to `true`. the mutated-static gate must cover `kind === 'in'` metas, not only `kind === 'property'`
delete Array.from;
Object.fromEntries = function () {};
export const hasFrom = 'from' in Array;
export const hasFromEntries = 'fromEntries' in Object;
export const hasOf = 'of' in Array;
