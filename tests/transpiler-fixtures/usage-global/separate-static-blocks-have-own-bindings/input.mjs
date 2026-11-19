// A closure in the second static block reads its string, not the first block's array.
class N { static { const s = [1, 2]; } static { const s = 'ab'; const f = () => s.at(-1); f(); } }
