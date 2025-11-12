const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getUsers,
  getUserById,
  createUser ,
  updateUser ,
  deleteUser ,
} = require('../../Controllers/UserController');


router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
module.exports = router;


module.exports = router;