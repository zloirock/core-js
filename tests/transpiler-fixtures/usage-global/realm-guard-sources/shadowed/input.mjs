// Keep the source guard and distinguish realm values from user properties.
function read(globalThis) { return (flag ? globalThis : globalThis).window?.Array.from([3]); } export { read };
