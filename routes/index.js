const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = mongoose.model('messages');
const User = mongoose.model('users');

router.get('/', (req, res) => {
  if(req.user){
    const newMessage = {
      message: 'Hello World',
      user: req.user.id
    }

    new Message(newMessage)
    .save()
    .then(message => {

    })
  }

  res.render('index/index');
});

module.exports = router;
