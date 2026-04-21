// five Array.from references: one as receiver, four as args. only the receiver gets consumed
// by the filter/flat/flatMap substitutions, so the remaining four must each find their own slot
Array.from(s).filter(Array.from).flat(Array.from).flatMap(Array.from, Array.from);
