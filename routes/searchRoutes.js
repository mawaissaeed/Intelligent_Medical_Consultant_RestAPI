const express = require('express');
const {verifyToken} = require('../utilities');
const {getAllSymptoms,getMatchingDiseases,getDifferentialDiagnosis} = require('../controllers/searchController');

const router = express.Router();



router.post('/search', verifyToken, getMatchingDiseases);
router.get('/search', getAllSymptoms);
//router.get('/doctor/:id',getDoctor);
router.put('/search', verifyToken, getDifferentialDiagnosis);
//router.delete('/doctor/:id',deleteDoctor);

module.exports = {
    routes: router
}