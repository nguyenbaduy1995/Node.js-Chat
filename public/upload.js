/* $('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});
*/
var pseudo = ""
socket.on('file', function(data) {
  addFile(data['message'], data['pseudo'], new Date().toISOString(), false);
})
$('#upload-input').on('change', function () {
  console.log('tui vao input roi')
  var files = $(this).get(0).files

  if (files.length > 0) {
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData()

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i]

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name)
    }
    console.log('Before ajax')
    $.ajax({
      url: '/upload/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        console.log('upload successful!\n' + data)
      },
      xhr: function () {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest()

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function (evt) {
          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total
            percentComplete = parseInt(percentComplete * 100)

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%')
            $('.progress-bar').width(percentComplete + '%')

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Done')
            }
          }
        }, false)

        return xhr
      }
    })
    console.log(file)
    sentFile(file)
  }
})

function addFile (msg, pseudo, date, self) {
  if (self) var classDiv = 'row message self'
  else var classDiv = 'row message'
  $('#chatEntries').append('<div class="' + classDiv + '"><p class="infos"><span class="pseudo">' + pseudo + '</span>, <time class="date" title="' + date + '">' + date + `</time></p><a href="/file/${msg}"><p>` + msg + '</p></a></div>')
  time()
}
function sentFile (file) {
  if (pseudo == '') {
    $('#modalPseudo').modal('show')
  } else 		{
    socket.emit('file', file.name)
    addFile(file.name, 'Me', new Date().toISOString(), true)
  }
}
