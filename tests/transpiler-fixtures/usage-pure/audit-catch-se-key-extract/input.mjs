// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try { risky(); } catch ({ [(e1(), 'at')]: v }) { console.log(typeof v); }
try { risky(); } catch ({ [(e2(), 'flat')]: f, message }) { console.log(typeof f, message); }
try { risky(); } catch ({ [(e3(), 'includes')]: i = dflt() }) { console.log(typeof i); }
try { risky(); } catch ({ [(e4(), 'flatMap')]: m, ...rest }) { console.log(typeof m, rest); }
// A concatenated constant key retains its effect just like a sequence key.
try { risky(); } catch ({ [(e5(), 'toRevers') + 'ed']: r }) { console.log(typeof r); }
// In a multi-property catch pattern, the first default runs before the second key.
try { risky(); } catch ({ [(e6(), 'toSorted')]: ts = dflt2(), [(e7(), 'toSpliced')]: tsp }) { console.log(typeof ts, typeof tsp); }
try { risky(); } catch ({ [(e8(), 'findLast')]: fnl = dflt3(), ...restA }) { console.log(typeof fnl, restA); }

// Two defaulted properties retain key, read, default order independently.
try { risky(); } catch ({ [(e9(), 'findLastIndex')]: fli = dflt4(), [(e10(), 'with')]: w10 = dflt5() }) { console.log(fli, w10); }

// A plain key also keeps its default lazy when the selected instance value is undefined.
try { risky(); } catch ({ entries: en = dflt6() }) { console.log(en); }

// An ordinary sibling read stays between the preceding default and the following key.
try { risky(); } catch ({ [(e11(), 'keys')]: ks = dflt7(), message, [(e12(), 'fill')]: fi }) { console.log(ks, message, fi); }

// A nested pattern under Symbol.iterator reads the selected iterator method once, then
// resolves the function-name binding from that value.
try { risky(); } catch ({ [Symbol.iterator]: { name } }) { console.log(name); }
try { risky(); } catch ({ [Symbol.iterator]: { name }, ...rest }) { console.log(name, rest); }
