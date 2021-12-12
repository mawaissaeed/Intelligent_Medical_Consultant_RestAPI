const express = require('express');
const {signup, login, logout, resetPassword, isTokenExpire} = require('../controllers/authenticationController');

const router = express.Router();

router.post('/auth',login);
router.get('/auth',logout);
router.get('/auth/:email',resetPassword);
router.put('/auth',signup);
router.delete('/auth',isTokenExpire);

module.exports = {
    routes: router
}