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



router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getChampions);
router.get('/:id', getChampionById);
router.post('/', createChampion);
router.put('/:id', updateChampion);
router.delete('/:id', deleteChampion);
module.exports = router;


module.exports = router;