// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const receiver = flag ? Object : user;
const { entries } = receiver;
export { entries };
