// An inline spread preserves the alias through which a mutation reaches the selected element.
const box = [[1]];
const [viaCensus] = [...[box]];
viaCensus.push('s');
box[0].values();
export { viaCensus };
