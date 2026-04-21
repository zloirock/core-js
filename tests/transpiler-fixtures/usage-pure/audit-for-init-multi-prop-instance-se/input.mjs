let sideFx = () => 0;
for (const { at, flat } = (sideFx(), [[1, 2], [3]]); false;) { at(0); flat(); }
