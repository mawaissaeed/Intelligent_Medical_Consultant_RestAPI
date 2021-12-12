const express = require('express');
const {addDataSet} = require('../controllers/deductiveKBController');

const router = express.Router();

router.post('/data',addDataSet);

module.exports = {
    routes: router
}