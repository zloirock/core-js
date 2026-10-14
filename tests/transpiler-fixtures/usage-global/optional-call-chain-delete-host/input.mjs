// a `delete` of a member the continuation of a combined dispatch runs on into takes the whole
// operator into the guard: a short-circuit answers true, and otherwise the member is deleted for
// real - absorbed into the alternate it was only read. the dispatch's own result is no member, so
// deleting it keeps the operator around the guard
const box = globalThis.box;
export const plainReceiver = delete box.list.flat?.().at(0).k;
export const liveLink = delete box?.list.toSorted?.().findLast(Boolean).k;
export const optionalTail = delete box.list.toReversed?.().find(Boolean)?.k;
// NEGATIVE: the dispatch's own result is deleted as written
export const ownResult = delete box.list.flatMap?.(x => [x]).includes(1);
