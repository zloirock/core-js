// An optional environment probe keeps the nullable realm and its static read.
export function read() {
  return (typeof window !== "undefined" ? window : undefined)?.Array.from([3]);
}
