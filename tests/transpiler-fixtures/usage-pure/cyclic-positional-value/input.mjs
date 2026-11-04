// A self-referencing positional var remains unknown without recursing during analysis.
var [saved] = [saved];
saved.at(0);
