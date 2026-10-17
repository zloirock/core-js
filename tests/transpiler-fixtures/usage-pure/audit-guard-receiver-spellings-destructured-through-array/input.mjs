const [{ self: fromArray }] = [globalThis];
export const destructuredThroughArray = fromArray.Promise.resolve(1);
