Function('return this')!patchRegExp$exec = (run) ->
  (assert) ->
    originalExec = RegExp::exec
    RegExp::exec = -> originalExec ...
    try
      return run assert
    catch e
      throw e
    finally
      RegExp::exec = originalExec
    return 