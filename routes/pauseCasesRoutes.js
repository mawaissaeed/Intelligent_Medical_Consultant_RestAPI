const express = require('express');
const {verifyToken} = require('../utilities');
const {addCase, getCase, deleteCase} = require('../controllers/pauseCasesController');

const router = express.Router();

router.post('/pauseCases',verifyToken, addCase);
router.put('/pauseCases',verifyToken,getCase);
router.delete('/pauseCases',verifyToken,deleteCase);

module.exports = {
    routes: router
}