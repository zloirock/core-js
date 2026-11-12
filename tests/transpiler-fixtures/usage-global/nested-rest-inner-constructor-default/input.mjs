// Rest stops pairing with the outer source but retains an inner constructor default.
const read = (...[{ inner: { from } = Array } = {}]) => from;
