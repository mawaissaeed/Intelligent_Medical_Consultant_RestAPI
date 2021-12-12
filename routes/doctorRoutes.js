const express = require('express');
const {verifyToken} = require('../utilities');
const {addDoctor, getAllDoctors, getDoctor, updateDoctor,deleteDoctor} = require('../controllers/doctorController');

const router = express.Router();

router.post('/doctor',verifyToken,addDoctor);
router.get('/doctor',getAllDoctors);
router.get('/doctor/:id',getDoctor);
router.put('/doctor/:id',updateDoctor);
router.delete('/doctor/:id',deleteDoctor);

module.exports = {
    routes: router
}