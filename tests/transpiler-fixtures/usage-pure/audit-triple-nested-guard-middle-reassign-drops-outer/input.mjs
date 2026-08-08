// Triple-nested guards: a reassignment between the middle and innermost guard makes BOTH outer
// "string" guards stale (each checked x before the write), while the innermost `object || string`
// guard re-narrows after it and stays fresh. Only the innermost guard survives, narrowing x to
// its full union (string | number[]), so .at must emit BOTH array and string arms; keeping either
// stale outer "string" guard would unsoundly drop the array arm.
declare let x: string | number[];
declare function readAny(): string | number[];

if (typeof x === "string") {
  if (typeof x === "string") {
    x = readAny();
    if (typeof x === "object" || typeof x === "string") {
      x.at(0);
    }
  }
}
