App.Authentication.reopenClass
  alwaysSendCsrfToken: ->
    token = $('meta[name="csrf-token"]').attr('content')
    $.ajaxPrefilter (options, originalOptions, xhr) ->
      xhr.setRequestHeader('X-CSRF-Token', token)