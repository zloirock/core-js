// TypeScript declaration merging: `class C<T>` + sibling `interface C<T>` shares the
// same generic. concrete receiver type arg propagates through the merged interface
// body annotations, so call-site dispatch picks the array-specific or string-specific
// polyfill based on the concrete `T`
class C<T> { construct(): void {} }
interface C<T> { extra(): T; box: T; }
declare const x: C<number[]>;
declare const y: C<string>;
x.extra().at(0);
x.box.includes(1);
y.extra().padStart(3);
