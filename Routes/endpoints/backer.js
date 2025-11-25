const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getBackers,
  getBackerById,
  createBacker ,
  updateBacker ,
  deleteBacker ,
} = require('../../Controllers/Backer/BackerController');
const { verifyToken } = require("../../middleware/auth");


router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/',getBackers);
router.get('/getBacker/:id',verifyToken, getBackerById);
router.post('/create',verifyToken, createBacker);
router.put('/update/:id',verifyToken, updateBacker);
router.delete('/delete/:id',verifyToken, deleteBacker);



module.exports = router;

