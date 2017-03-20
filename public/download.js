$("#downfile").on('click', function() {
	console.log('cac')
	var files = $(this).get(0)
	$.ajax({
		url: '/file/'+files,
		type: 'GET',
		contentType: false,
      	success: function (data) {
        	console.log('download successful!')
      	},
	})
})