// A seal above an excluded optional realm slot keeps the native throw.
// Global mode is a presence control; entry exclusion belongs to pure mode.
consume((globalThis.self?.Array).from);
