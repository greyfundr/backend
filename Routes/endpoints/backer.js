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



router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getBackers);
router.get('/:id', getBackerById);
router.post('/', createBacker);
router.put('/:id', updateBacker);
router.delete('/:id', deleteBacker);
module.exports = router;


module.exports = router;

