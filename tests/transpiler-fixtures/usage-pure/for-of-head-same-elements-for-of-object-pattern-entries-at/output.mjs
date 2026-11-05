// A literal-object loop element retains its native static and own data-property reads.
// An own at value does not request an instance helper.
for (const {
  w: {
    entries: viaDualBesideData
  },
  at: viaDataBeside
} of [{
  w: Object,
  at: 1
}]) [viaDualBesideData, viaDataBeside];