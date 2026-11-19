const arr = [1, 2];
{
let out, e; [{ at: e }] = [(out = 1, arr)]; use(e, out);
}
