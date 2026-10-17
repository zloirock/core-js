const [[viaNestedRead]] = [...[[[1]]]];
viaNestedRead.flatMap(x => x);
export { viaNestedRead };
