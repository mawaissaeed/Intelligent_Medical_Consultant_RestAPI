const express = require('express');
const {verifyToken} = require('../utilities');
const {followDoctorRequest, acceptRequest, searchDoctors, getAllFriends,deleteRequest, deleteFriend, getAllRequests} = require('../controllers/doctorsPanelController');

const router = express.Router();

router.post('/doctorsPanel',verifyToken, followDoctorRequest);
router.get('/doctorsPanel/:email',verifyToken,getAllFriends);
router.get('/doctorsPanel',verifyToken, searchDoctors);
router.put('/doctorsPanel',verifyToken, acceptRequest);
router.patch('/doctorsPanel',verifyToken, getAllRequests);
router.delete('/doctorsPanel',verifyToken,deleteRequest);
router.delete('/doctorsPanel/:email',verifyToken,deleteFriend);

module.exports = {
    routes: router
}