// A computed instance key on an unchanged identifier receiver runs after its null test and before
// the single method read. A nullish receiver throws before the key effect can run.
const { [(effectful(), 'flat')]: m } = arr;
const probe = [1, 2].includes(2);
