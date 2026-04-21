let sideFx = () => 0;
for (const { from, of } = (sideFx(), Array); sideFx() < 1;) { from([of(0)]); break; }
