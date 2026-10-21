// A caller argument retains its guarded navigation when one static is excluded.
// Its live receiver call is shared by the served and native pattern slots.
(({ of, from }) => [of(3), from([4])])(((() => {
  [7].at(0);
  return globalThis.window;
})()?.self).Array);
