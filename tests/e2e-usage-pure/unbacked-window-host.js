// Keep host writes outside the reads: an in-module window mutation would deoptimize the
// proxy navigation this rig exercises. The indirect lookup also works after stripping globalThis.
const REALM = Function('return this')();

export function withNestedWindow(absent, read) {
  const saved = Object.getOwnPropertyDescriptor(REALM, 'window');
  // Browsers own their window binding. Their real self-references exercise the defined branch.
  if (REALM.window === REALM || saved && !saved.configurable) return read(false);
  const live = { Array: REALM.Array };
  live.window = live;
  Object.defineProperty(REALM, 'window', {
    configurable: true,
    writable: true,
    value: { window: { window: absent ? null : live } },
  });
  try {
    return read(true);
  } finally {
    if (saved) Object.defineProperty(REALM, 'window', saved);
    else delete REALM.window;
  }
}

// A guard can observe two distinct window reads. Keep the first live and the second absent.
export function withChangingWindow(read) {
  const saved = Object.getOwnPropertyDescriptor(REALM, 'window');
  if (REALM.window === REALM || saved && !saved.configurable) return read(false);
  const self = Object.getOwnPropertyDescriptor(REALM, 'self');
  let reads = 0;
  REALM.self = REALM;
  Object.defineProperty(REALM, 'window', {
    configurable: true,
    get() { return reads++ === 0 ? REALM : undefined; },
  });
  try {
    return read(true);
  } finally {
    if (saved) Object.defineProperty(REALM, 'window', saved);
    else delete REALM.window;
    if (self) Object.defineProperty(REALM, 'self', self);
    else delete REALM.self;
  }
}
