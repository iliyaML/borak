const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const PORT = process.env.PORT || 5000;

// load user model
require('./models/User');

require('./config/passport')(passport);

// authentiation routes
const auth = require('./routes/auth');

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

app.get('/', (req, res) => {
  res.send('Hello World');
});

// cookieparser
app.use(cookieParser());

// expressSession
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
