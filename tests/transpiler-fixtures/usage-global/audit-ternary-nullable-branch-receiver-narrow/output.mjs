import "core-js/modules/es.array.includes";
// bare-receiver control: a nullish receiver throws the same TypeError transformed or not,
// so the nullable-branch ternary fold keeps the Array narrow when the ternary IS the
// receiver - only es.array.includes injects (no es.string.includes)
declare const c: boolean;
declare const nums: number[];
(c ? nums : null).includes(1);