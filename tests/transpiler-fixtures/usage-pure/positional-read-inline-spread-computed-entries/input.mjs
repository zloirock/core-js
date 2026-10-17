// A binding spread lets every following slot escape into the mutated alias.
const box = [[1]];
const [viaCensusShifted] = [...wrapped, box];
viaCensusShifted.push('s');
box[0].entries();
export { viaCensusShifted };
