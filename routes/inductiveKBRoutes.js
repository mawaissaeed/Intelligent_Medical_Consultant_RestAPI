const express = require('express');
const {verifyToken} = require('../utilities');
const {addCase,getCases,updateCase,deleteCase} = require('../controllers/inductiveKBController');

const router = express.Router();

router.post('/inductiveKB', verifyToken, addCase);
// router.get('/doctor',getAllDoctors);
// router.post('/inductiveKB/:id', verifyToken, getCases);
// router.put('/inductiveKB/:id', verifyToken, updateCase);
// router.delete('/inductiveKB/:id',verifyToken, deleteCase);

module.exports = {
    routes: router
}