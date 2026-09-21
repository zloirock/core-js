// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const { [(effect(), "entries")]: entries = fallback() } = flag ? Object : user;
export { entries };
