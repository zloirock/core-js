// direct self-cycle type alias — resolution bails immediately without hanging
type Self = Self;
declare const x: Self;
const r = (x as any).at(0);
globalThis.__r = r;
