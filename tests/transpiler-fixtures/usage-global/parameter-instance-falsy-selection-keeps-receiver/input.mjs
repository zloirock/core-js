// Falsy selecting operands retain their native value before a logical fallback.
// A bound empty string used as the selected receiver still receives its string helper.
const zero = 0;
const fallback = [1];
const empty = '';
export const array = (({ at }) => at)(zero || fallback);
export const string = (function ({ includes } = zero || empty) { return includes; })();
