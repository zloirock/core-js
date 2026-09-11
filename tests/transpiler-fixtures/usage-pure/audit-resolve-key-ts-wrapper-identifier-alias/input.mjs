// computed-key identifier alias wrapped in a TS cast: `arr[(k) as any]` where `k = 'at'`
// should still dispatch `.at` to the array instance polyfill
const arr = [1, 2, 3];
const k = 'at';
arr[(k) as any](0);
