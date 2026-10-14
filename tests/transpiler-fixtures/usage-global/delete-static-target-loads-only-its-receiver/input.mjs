// a `delete` names its target without reading it, so the static it removes takes nothing of its own:
// only what is read on the way there does - the receiver, with its constructor family, and a member
// standing below the target. a sequence around the member makes it a value the operator never names
delete Array.from;
delete Array['of'];
delete (Object.groupBy);
delete Map.groupBy;
delete Promise?.allSettled;
delete Object.entries.name;
delete (0, Object.fromEntries);
