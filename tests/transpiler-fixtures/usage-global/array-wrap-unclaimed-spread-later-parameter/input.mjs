// A later parameter reads the extracted name, preventing body capture.
// Pure claims nothing and must retain the original inline spread.
function read([{ y: { at: a } }] = [...[nb]], b = a) { return b; }
export { read };
