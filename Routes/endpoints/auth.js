const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  loginUser,
  forgotPassword,
  createUser ,
  getProfile ,
} = require('../../Controllers/AuthController');



router.use(express.urlencoded({ extended: true }));




// Routes
router.post('/login', loginUser);
router.post('/register', createUser);
router.get('/forgot/:id', forgotPassword);
router.get('/getProfile/:id', getProfile);




module.exports = router;