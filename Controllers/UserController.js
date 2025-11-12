// userController.js
// This file contains all the basic CRUD controllers for user management in a Node.js application using Express.js and MySQL (via mysql2 package).
// Assumptions:
// - You have a MySQL database with a 'users' table: id (INT, AUTO_INCREMENT, PRIMARY KEY), name (VARCHAR), email (VARCHAR, UNIQUE), password (VARCHAR).
// - Database connection is handled in '../config/database.js' exporting a mysql2 pool (e.g., const pool = mysql.createPool({...}); module.exports = pool;).
// - Install dependencies: npm install express mysql2 (and bcrypt for production password hashing).
// - In production, always hash passwords (e.g., using bcrypt) and add input validation (e.g., using Joi or express-validator).
// - These controllers handle basic operations: GET all users, GET by ID, POST create, PUT update, DELETE by ID.

const pool = require('../dbconnect');
const crypto = require('crypto');



// Get all users
const getUsers = async (req, res) => {
  const con = await pool.getConnection();
  try {
          console.log("TEST DATA :");
          const result = await con.execute("SELECT * FROM users")
          
              
                console.log(result); // result will contain the fetched data
                res.send(result);
            
             // res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  finally
  {
    con.release();
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
      
        const con = await pool.getConnection();

    const [rows] = await pool.execute(
            "SELECT * FROM users where id = ? ",[id]
        );
    
    console.log(rows[0]); // result will contain the fetched data
    res.send(rows[0]);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user
const createUser  = async (req, res) => {
  const { name, email, username,password,phone } = req.body;
  const userId = crypto.randomUUID();
  const currentDate = new Date();
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    // In production: const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO `users`( `full_name`, `username`, `email`,`phone`, `password_hash`) VALUES (?,?,?,?,?)'
    con.query(sql,[name,username,email,phone,password], function (err, result, fields) {
      if (err) throw err;
      console.log(result); // result will contain the fetched data
      res.send('User registered successfully!');
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user by ID
const updateUser  = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  if (!name && !email && !password) {
    return res.status(400).json({ error: 'At least one field (name, email, or password) must be provided' });
  }
  try {
    // In production: if (password) { const hashedPassword = await bcrypt.hash(password, 10); }
    const updateFields = [];
    const values = [];
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (password) {
      updateFields.push('password = ?');
      values.push(password); // Use hashedPassword in production
    }
    values.push(id);

    const [result] = await db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }
    res.status(200).json({ message: 'User  updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user by ID
const deleteUser  = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }
    res.status(200).json({ message: 'User  deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser ,
  updateUser ,
  deleteUser ,
};