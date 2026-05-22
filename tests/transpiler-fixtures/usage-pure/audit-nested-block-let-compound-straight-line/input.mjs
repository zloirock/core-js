// nested bare blocks. the inner binding lives in the innermost BlockStatement,
// whose `.body` array must be reached the same way as the outer block; otherwise
// the straight-line walker drops the compound assignment and over-injects a
// polyfill on the wrong type. flat distinguishes this fixture from siblings.
{
  {
    let x: string | number[] = [1, 2];
    x = "hi";
    x.includes("h");
  }
}
