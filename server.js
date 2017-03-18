//	Customization
var path = require('path')
var formidable = require('formidable')
var appPort = 16558
var fs = require('fs')
// Librairies

var express = require('express'), app = express()
var http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server)

var jade = require('jade')
// var io = require('socket.io').listen(app);
var pseudoArray = ['admin'] // block the admin username (you can disable it)

// Views Options

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.set('view options', { layout: false })

app.use(express.static(__dirname + '/public'))

// Render and send the main page

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/views', 'home.html'))
  // res.render('home.jade');
})

app.post('/upload', function (req, res) {
  console.log('im heree')
  // create an incoming form object
  var form = new formidable.IncomingForm()

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads')

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function (field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name))
  })

  // log any errors that occur
  form.on('error', function (err) {
    console.log('An error has occured: \n' + err)
  })

  // once all the files have been uploaded, send a response to the client
  form.on('end', function () {
    res.end('success')
  })

  // parse the incoming request containing the form data
  form.parse(req)
})
server.listen(appPort)
// app.listen(appPort);
console.log('Server listening on port ' + appPort)

// Handle the socket.io connections

var users = 0 // count the users

io.sockets.on('connection', function (socket) { // First connection
  users += 1 // Add 1 to the count
  reloadUsers() // Send the count to all the users
  socket.on('message', function (data) { // Broadcast the message to all
    if (pseudoSet(socket))		{
      var transmit = {date: new Date().toISOString(), pseudo: socket.nickname, message: data}
      socket.broadcast.emit('message', transmit)
      console.log('user ' + transmit['pseudo'] + ' said "' + data + '"')
    }
  })
	socket.on('file', function (data) { // Broadcast the message to all
    if (pseudoSet(socket))		{
      var transmit = {date: new Date().toISOString(), pseudo: socket.nickname, message: data}
      socket.broadcast.emit('file', transmit)
      console.log('user ' + transmit['pseudo'] + ' said "' + data + '"')
    }
  })
  socket.on('setPseudo', function (data) { // Assign a name to the user
    if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
      pseudoArray.push(data)
      socket.nickname = data
      socket.emit('pseudoStatus', 'ok')
      console.log('user ' + data + ' connected')
    } else		{
      socket.emit('pseudoStatus', 'error') // Send the error
    }
  })
  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1
    reloadUsers()
    if (pseudoSet(socket))		{
      console.log('disconnect...')
      var pseudo
      pseudo = socket.nickname
      var index = pseudoArray.indexOf(pseudo)
      pseudo.slice(index - 1, 1)
    }
  })
})

function reloadUsers () { // Send the count of the users to all
  io.sockets.emit('nbUsers', {'nb': users})
}
function pseudoSet (socket) { // Test if the user has a name
  var test
  if (socket.nickname == null) test = false
  else test = true
  return test
}
