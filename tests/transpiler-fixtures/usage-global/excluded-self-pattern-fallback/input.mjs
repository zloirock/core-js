// The fallback still supplies the pattern when the excluded realm slot is absent.
// Global mode is a presence control; entry exclusion belongs to pure mode.
const { from } = globalThis.self?.Array ?? {}; consume(from);
