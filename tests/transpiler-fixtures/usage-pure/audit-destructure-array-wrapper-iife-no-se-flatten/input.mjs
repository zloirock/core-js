// A pure IIFE in an array wrapper supplies the mirrored static receiver.
const [{ from }] = [(() => Array)()];
