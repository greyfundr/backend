// ChampionController.js
// This file contains all the basic CRUD controllers for Champion management in a Node.js application using Express.js and MySQL (via mysql2 package).
// Assumptions:
// - You have a MySQL database with a 'Champions' table: id (INT, AUTO_INCREMENT, PRIMARY KEY), name (VARCHAR), email (VARCHAR, UNIQUE), password (VARCHAR).
// - Database connection is handled in '../config/database.js' exporting a mysql2 pool (e.g., const pool = mysql.createPool({...}); module.exports = pool;).
// - Install dependencies: npm install express mysql2 (and bcrypt for production password hashing).
// - In production, always hash passwords (e.g., using bcrypt) and add input validation (e.g., using Joi or express-validator).
// - These controllers handle basic operations: GET all Champions, GET by ID, POST create, PUT update, DELETE by ID.

const pool = require('../../dbconnect');
const crypto = require('crypto');



// Get all Champions
  const getChampions = async (req, res) => {
  const con = await pool.getConnection();
  let users = [];
  try {
          console.log("TEST DATA :");
          const result = await con.execute("SELECT * FROM champions")
          
            const user = await fetchDataAndSaveToArray(result[0])
            res.status(200).json(user);
            
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

async function fetchDataAndSaveToArray(backers) {
  const con = await pool.getConnection();
    const idsToQuery = backers; // Example array of IDs to query
    const resultsArray = [];

    // Create an array of promises for each database query
    const queryPromises = idsToQuery.map(async (id) => {
      
         ids = id.champion_id;    
         console.log(ids);
        const query = `SELECT id,first_name,username,profile_pic FROM users WHERE id = ?`;
        return new Promise((resolve, reject) => {

        const results = con.execute('SELECT id,first_name,username,profile_pic FROM users WHERE id = ?',
            [ids]);

                
                resolve(results);
            
        });
    });

    try {
        // Wait for all promises to resolve
        const allResults = await Promise.all(queryPromises);

        // Flatten the array of results (as each query might return an array of rows)
        allResults.forEach(result => {
            console.log(result);
            resultsArray.push(...result[0]);
        });

        console.log('All results:', resultsArray);
        return resultsArray;

    } catch (error) {
        console.error('Error executing queries:', error);
        throw error;
    } finally {
        con.release(); // Close the connection when done
    }
}

// Get Champion by ID
const getChampionById = async (req, res) => {
  const { id } = req.params;
  try {
    con.query("SELECT * FROM Champions where id = ? ",[id], function (err, result, fields) {
                if (err) throw err;
                console.log(result); // result will contain the fetched data
                res.send(result);
              }); 
    
  } catch (error) {
    console.error('Error fetching Champion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new Champion
const createChampion  = async (req, res) => {
  const { userid, championid, amount } = req.body;

  if (!userid || !championid) {
    return res.status(400).json({ error: 'UserId and Championidare required' });
  }
  try {
    // In production: const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO `Champions`( `user_id`, `champion_id`, `amount`) VALUES (?,?,?)'
    con.query(sql,[userid,championid,amount], function (err, result, fields) {
      if (err) throw err;
      console.log(result); // result will contain the fetched data
      res.send('Champion registered successfully!');
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Champion already exists' });
    }
    console.error('Error creating Champion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Champion by ID
const updateChampion  = async (req, res) => {
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
      `UPDATE Champions SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Champion  not found' });
    }
    res.status(200).json({ message: 'Champion  updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error updating Champion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Champion by ID
const deleteChampion  = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM Champions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Champion  not found' });
    }
    res.status(200).json({ message: 'Champion  deleted successfully' });
  } catch (error) {
    console.error('Error deleting Champion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getChampions,
  getChampionById,
  createChampion ,
  updateChampion ,
  deleteChampion ,
};