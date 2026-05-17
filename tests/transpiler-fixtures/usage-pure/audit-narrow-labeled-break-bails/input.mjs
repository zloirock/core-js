// labeled `break` BEFORE the assignment inside its target block: `outer: { if (c)
// break outer; x = "hello"; }` - the break may exit the labeled block before the
// assignment runs. `precedingSiblingsExitFree` scans the if-statement; labels is empty
// at the scan root (only LabeledStatements walked INTO contribute), so `break outer`
// is treated as an exit and the assignment is correctly rejected
let x = [1, 2, 3];
let c = true;
outer: {
  if (c) break outer;
  x = "hello";
}
x.at(0);
