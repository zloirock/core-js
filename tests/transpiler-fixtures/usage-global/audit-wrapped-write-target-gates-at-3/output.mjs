import "core-js/modules/es.array.at";
// prototype-method template tags stay raw through wrappers on both parsers
const trr: number[] = [1];
// @ts-expect-error a tagged call of the member is the shape under test
trr.at`lit`;