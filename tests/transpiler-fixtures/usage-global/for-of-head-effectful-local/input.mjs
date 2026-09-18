// An effect before a literal iterable does not make a local head escape.
// The body reads only an intrinsic property, so Map stays on its narrow constructor entry.
for (const value of (effect(), [Map])) void value.name;
