const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getChampions,
  getChampionById,
  createChampion ,
  updateChampion ,
  deleteChampion ,
} = require('../../Controllers/Champion/ChampionController');
const { verifyToken } = require("../../middleware/auth");


router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getChampions);
router.get('/getChampion/:id',verifyToken, getChampionById);
router.post('/create', verifyToken, createChampion);
router.put('/update/:id',verifyToken, updateChampion);
router.delete('/delete/:id',verifyToken, deleteChampion);



module.exports = router;