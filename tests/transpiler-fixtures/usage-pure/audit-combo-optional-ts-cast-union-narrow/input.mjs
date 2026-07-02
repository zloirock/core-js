// combo: TS cast narrows discriminated union to `number[]` leg + outer optional chain guards
// the receiver + Array-specific instance.at polyfill fires on the narrowed leg
type Shape = { data: number[] } | { data: string };
declare const s: Shape;
(s as { data: number[] })?.data.at(0);
