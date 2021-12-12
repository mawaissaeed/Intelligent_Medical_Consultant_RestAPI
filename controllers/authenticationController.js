'use strict';

const firebase = require('firebase');
const firestore = firebase.firestore();
const jwt = require('jsonwebtoken');
const config = require('../config');
const ResponseMsg = require('../models/responseMsg');


const signup = async(req,res) =>{
  const data = req.body;
  if(data.email === '' && data.password === '') {
    res.status(404).send("Enter details to sign up.");
  } else {

    firebase
    .auth()
    .createUserWithEmailAndPassword(data.email, data.password)
    .then((result) => {
      console.log('User registered successfully!');
      res.status(200).send("User registered successfully!");
    })
    .catch(error => res.status(404).send(new ResponseMsg(error.message,-1)))      
  }
}

const login = async (req,res,next)=> {
    let email = req.body['email'];
    let password = req.body['password'];
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        const user = {
          uid: result.user.uid,
          email: result.user.email,
        }
        console.log(user);
        jwt.sign(user, config.firebaseConfig.apiKey , {expiresIn: '7d'}, (err, token) =>{
          res.status(200).send({token});
        });

        
      })
      .catch(error => res.status(400).send(new ResponseMsg(error.message,-1)))
}

const logout = async (req,res,next)=> {
    firebase.auth().signOut().then(() => {
      console.log('Signed Out');
      res.status(200).send(new ResponseMsg("Signed Out",1));
    }, (error) => {
      
      console.error('Sign Out Error', error);
      res.status(400).send(new ResponseMsg(error.message,-1));
    });
}

const resetPassword = async (req, res) => {
  const email = req.params.email;
  firebase.auth().sendPasswordResetEmail(email)
    .then(function (user) {
      res.status(200).send(new ResponseMsg("Please Check Your email",1));
    }).catch(function (e) {
      console.log(e);
      res.status(404).send(new ResponseMsg("Error with reset password",-1));
    })
}

const isTokenExpire = async (req, res) => {
  const token = req.body['token'];
  jwt.verify(token, config.firebaseConfig.apiKey, (error, authData)=>{
      if(error){
        res.status(403).send(new ResponseMsg('Token expired',-1));
      }else{
        res.status(200).send(new ResponseMsg('Token verified successfully', 1));
      }
  });
}

module.exports = {
    signup,
    login,
    logout,
    resetPassword,
    isTokenExpire    
}