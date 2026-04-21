// destructure init (`Promise`) has its own queued Promise polyfill transform; the
// destructure pass calls extractContent(initStart, initEnd) to consume it before
// re-emitting the statement, so the Promise transform must be removed from queue
// state (#sorted / #prefixMaxEnd / #byGuardedRoot / #transforms) atomically
const { resolve } = Promise;
resolve(1);
