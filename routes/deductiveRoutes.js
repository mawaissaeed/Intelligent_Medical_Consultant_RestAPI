const express = require('express');
const {verifyToken} = require('../utilities');
const {addDataSet, addDisease} = require('../controllers/deductiveKBController');

const router = express.Router();

router.post('/deductiveKB', verifyToken, addDataSet);
router.put('/deductiveKB', verifyToken, addDisease);

module.exports = {
    routes: router
}