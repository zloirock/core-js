// UTF-8 BOM at the start of the source is stripped by the transform; a single polyfill
// import is injected at program start and the BOM does not leak into the output
Array.from(x);
