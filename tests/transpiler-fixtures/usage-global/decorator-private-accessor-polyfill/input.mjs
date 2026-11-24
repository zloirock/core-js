// A decorated private accessor initializes a Set. The output must include both
// decorator metadata and the Set constructor.
class C {
  @dec accessor #foo = new Set();
}
