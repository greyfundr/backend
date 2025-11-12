const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getFollowers,
  getFollowerById,
  createFollower ,
  updateFollower ,
  deleteFollower ,
} = require('../../Controllers/Follower/FollowerController');



router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getFollowers);
router.get('/:id', getFollowerById);
router.post('/', createFollower);
router.put('/:id', updateFollower);
router.delete('/:id', deleteFollower);



module.exports = router;