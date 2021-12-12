const express = require('express');
const {verifyToken} = require('../utilities');
const {getMatchingDiseases} = require('../controllers/inductiveKBSearchController');

const router = express.Router();



router.post('/inductiveKBSearch', verifyToken, getMatchingDiseases);
// router.get('/search', verifyToken, getAllSymptoms);
//router.get('/doctor/:id',getDoctor);
//router.put('/doctor/:id',updateDoctor);
//router.delete('/doctor/:id',deleteDoctor);

module.exports = {
    routes: router
}