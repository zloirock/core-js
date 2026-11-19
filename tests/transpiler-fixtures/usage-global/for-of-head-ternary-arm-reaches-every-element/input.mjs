// a selection arm that is a for-of head over a literal - spelled as the head or as a pattern head's slot -
// holds every element in turn, so the union reads the static off each of them, as the bare head's own read
// does; a ternary's arm stays one whatever the elements are. the loops bring the iteration modules and each
// element its family, and the other arm its own static
for (const M of [Map, Array]) use((c ? M : Object).groupBy);
for (const P of [Promise, Array]) {
  const { try: viaDestructure } = c ? P : Array;
  use(viaDestructure);
}
for (const { S } of [{ S: Symbol }, { S: Array }]) use((c ? S : Array).keyFor);
