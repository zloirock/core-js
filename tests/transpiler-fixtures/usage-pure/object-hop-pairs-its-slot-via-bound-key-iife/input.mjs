// A bound computed hop key keeps its source meaning when the IIFE parameter moves to the body.
const hopKey = 'w';
const viaBoundKeyIife = (({ [hopKey]: { at: m } }) => m)({ w: [1, 2] });
export default [viaBoundKeyIife];
