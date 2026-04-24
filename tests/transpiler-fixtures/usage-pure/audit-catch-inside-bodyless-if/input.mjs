// Catch inside bodyless `if` - single-statement body is a block `{}`, so there is no
// scope escape. Confirm destructuring extraction still works.
if (cond) try {} catch ({ at, flat }) { at(0); flat(); }
