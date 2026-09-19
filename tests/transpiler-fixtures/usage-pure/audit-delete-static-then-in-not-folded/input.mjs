// `delete Array.from` mutates the static file-wide, so a later `'from' in Array` must NOT fold to
// `true` (the prop is absent at runtime). an ASSIGN mutation (`Object.fromEntries = ...`) likewise
// records the static so `'fromEntries' in Object` stays native (over-bail, but the result is still
// CORRECT). an unmutated static (`'of' in Array`) still folds: the bail must cover `in` checks too
delete Array.from;
Object.fromEntries = function () {};
export const hasFrom = 'from' in Array;
export const hasFromEntries = 'fromEntries' in Object;
export const hasOf = 'of' in Array;
