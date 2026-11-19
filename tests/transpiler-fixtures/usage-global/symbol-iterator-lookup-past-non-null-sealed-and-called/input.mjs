// A Symbol.iterator lookup past a `!`, sealed by a paren and then called, hides nothing from usage detection:
// the lookup pulls the iterator modules as it would without the assertion.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
declare const strs: string[] | null;
(strs?.[3]![Symbol.iterator])();
