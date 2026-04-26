// nested optional chains with `.includes(...)`: each chain has its own guard, but the
// instance-method rewrite still fires symmetrically inside both.
a?.b?.includes(1);
