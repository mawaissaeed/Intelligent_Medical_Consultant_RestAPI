'use strict';

const  jwt  = require('jsonwebtoken'); 
const config = require('./config');
const ResponseMsg = require('./models/responseMsg');



const verifyToken = async (req,res, next) =>{
    // const header = req.headers['authorization'];
    // const idToken = header.split(' ')[1];
    // admin
    // .auth()
    // .verifyIdToken(idToken)
    // .then((decodedToken) => {
    //     const uid = decodedToken.uid;
    //     console.log(uid);
    //     next();
    // })
    // .catch((error) => {
    //     // Handle errors
    //     console.log("Error: ", error);
    //     res.status(404).send("Error in Token Verification");
    // });




    // admin.auth().verifyIdToken(function(user) {
    //     if (user) {
    //       // User is signed in.
    //       console.log("loged in");
    //       next();
          
    //     }else{
    //       console.log("sign out");
    //       res.status(404).send("log out");
    //       return;
    //     }
    //   });




const token = req.headers['authorization'];
// console.log(token);
if(typeof token !== 'undefined'){
    // const token = header.split(' ')[1];
    //res.status(200).send(token);
    jwt.verify(token, config.firebaseConfig.apiKey, (error, authData)=>{
        if(error){
            
           return res.status(403).send(new ResponseMsg('Error in token verification', -1));
        }else{
            console.log('authData: ',authData)
            console.log("token auth")
            req.uid = authData.uid;
            // req.email = authData.email;
            next();
        }
    });
    
    
    
}else{
    //Forbidden
    console.log("Forbidden")
    res.status(403).send(new ResponseMsg("Invalid token! Please enter valid token", -1));
}
}

// const getAllSymptoms = async (req,res,next)=> {
//     try{
//         const symptoms = await firestore.collection('datasetDisease');
//         const data = await symptoms.get();
//         const symptomsArray = []

//         if(data.empty){
//             res.status(404).send('No symptom record found');
//         }else{
//             data.forEach(doc => {
//                 doc.data().Symptom.forEach(symptom => {
//                     symptomsArray.push(symptom);
//                 });                
//             });
//             let uniqueSymptoms = [...new Set(symptomsArray)];
//             res.send(uniqueSymptoms);
//         }
//     }catch(error){
//         res.status(400).send(error.message);
//     }
// }

module.exports = {
    verifyToken
}