same  = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
QUnit.assert.arrayEqual = !(a, b, message)->
  result = on
  if a.length isnt b.length => result = no
  else for i til a.length => if !same(a[i], b[i])
    result = no
    break
  @push result, a, b, message