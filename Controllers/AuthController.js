const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const con = require('../dbconnect');
const crypto = require('crypto');
const User = require('../Models/user')

// Register a new user
exports.createUser  = async (req, res) => {
  const { name, email, username,password,phone } = req.body;
  console.log(email)
  
  
  if (!phone || !email || !password) {
    return res.status(400).json({ error: 'Phone, email, and password are required' });
  }
  try {
     console.log(phone)
      let test = await User.create(email,password,phone);
      
      if(test)
      {     
      res.json({ message: 'User registered successfully!' });
      }
      
    
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry found:', err.sqlMessage);
      return res.status(409).json({ error: 'Email already exists' });
      
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Email or Phone' });
    }

    console.log(user);


    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect Password' });
    }

   

    // Generate token
    const payload = { user: user };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ msg: 'Logged in successfully', token });
  } catch (err) {
    //console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ msg: 'Logged in successfully', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ msg: 'Logged in successfully', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Other authentication-related functions can be added here