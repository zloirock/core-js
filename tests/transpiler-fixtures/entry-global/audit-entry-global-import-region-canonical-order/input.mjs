// entry-global `post()` now mirrors the main `programExit` tail
// (`finalizeInjector`): canonical-sort the import region across all flushes +
// normalize arrow-`_ref` params + prune unused refs + reorder refs below imports.
// without this housekeeping, sibling-plugin imports injected between our pre
// (`runEntryDetection` + flush) and post (final flush) would land in registration
// order rather than compat-data canonical order. this fixture exercises a
// single `core-js/actual/array/at` entry import; the entry-expansion produces
// multiple `core-js/modules/*` imports that MUST come out in registry order
import 'core-js/actual/array/at';
