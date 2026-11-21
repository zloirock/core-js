// Keep a generic dispatcher after extracting a mutator.
const extracted = [[1], [2]];
const m = extracted.splice;
export const viaMutatorExtraction = extracted[0].includes(5);
