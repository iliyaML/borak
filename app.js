const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const PORT = process.env.PORT || 80;

const io = require('socket.io').listen(app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}));

// load user model
require('./models/User');
require('./models/Message');

const Message = mongoose.model('messages');
const User = mongoose.model('users');

require('./config/passport')(passport);

// authentiation routes
const auth = require('./routes/auth');
//const index = require('./routes/index');

// keys
const keys = require('./config/keys');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
  useMongoClient:true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars')

// cookieparser
app.use(cookieParser());

// expressSession
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// public folder
app.use(express.static(path.join(__dirname, 'public')))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// globals
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// authentication routes
app.use('/auth', auth);

io.sockets.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('channel', function(data){
		// join new room, received as function parameter
		socket.join(data);
    socket.room = data;
    Message.find({ channel: data })
    .populate('user')
    .exec((err, messages) => {
      if(err){
        throw err;
      }
      socket.emit('output', messages);
    });
  })

  socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
            let channel = data.channel;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                console.log('Empty inputs');
                //sendStatus('Please enter a name and message');
            } else {
                // Insert message
                console.log(name);
                console.log(message);

                  const newMessage = {
                    message: message,
                    channel: channel,
                    user: name
                  }
                  new Message(newMessage)
                  .save()
                  .then(message => {
                    Message.findById({ _id: message._id })
                    .populate('user')
                    .then(message => {
                      io.in(socket.room).emit('output', [message]);
                      socket.broadcast.to(socket.room).emit('notification', message);
                    });
                  });
          }
        });

        // Handle clear
        socket.on('clear', function(data){
            // Remove all chats from collection
            Message.remove({}, function(){
                // Emit cleared
                socket.emit('cleared');
            });
        });
});



app.get('/', (req, res) => {
  res.render('index/index');
});
