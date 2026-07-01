// interface I extends NS.Base - namespace-qualified extends. parent ref resolution via
// segment-based type-declaration lookup finds the Base interface inside NS, member walk
// then sees Base's structural members and the array-typed `items` property narrows
namespace NS { export interface Base { items: number[] } }
interface I extends NS.Base {}
declare const i: I;
i.items.includes(1);
