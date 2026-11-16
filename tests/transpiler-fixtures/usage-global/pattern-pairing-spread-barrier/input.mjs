// A shifted source slot is not a certain array receiver.
const source = [...values, [3]];
const [held] = source;
held.at(0);
