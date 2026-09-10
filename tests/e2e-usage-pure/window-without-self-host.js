// the host a `self` ponyfill exists for: a realm exposing `window` and no `self` of its own. Node
// has neither and a browser has both, so no environment this suite runs in IS that host - it is
// built around the read and taken down again. The write lives here rather than beside the reads it
// serves: a slot write deoptimizes that name for its whole file, and `window` is exactly the name
// the runs under test navigate
export function withWindowWithoutSelf(read) {
  const built = globalThis.window === undefined;
  if (built) globalThis.window = globalThis;
  try {
    return read();
  } finally {
    if (built) delete globalThis.window;
  }
}

// ... and the same reason serves a run that DELETES: the slot the operator names has to exist for
// the navigation below it to answer, and writing it beside the delete would route the run through
// the mutated-slot channel instead of the landing under test
export function withRealmSlot(name, value, read) {
  globalThis[name] = value;
  try {
    return read();
  } finally {
    delete globalThis[name];
  }
}
