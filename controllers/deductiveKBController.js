'use strict';

const firebase = require('firebase');
const firestore = firebase.firestore();
const dataSet = require('../datasetJson.json');
const ResponseMsg = require('../models/responseMsg');



const addDataSet = async (req, res) => {
    let temp = {};
try{
    dataSet.forEach(item => {
        temp[item.Disease] = [];
    });
    dataSet.forEach(item => {
        temp[item.Disease].push(item.Symptom);
    });

    for(var key in temp) {
        console.log(key + " : " + temp[key]);
        // await firestore.collection('deductiveKB').doc(key).set({Symptom: temp[key]});
     }
     console.log("total: "+Object.keys(temp).length )

    res.status(200).send(new ResponseMsg("Successfully added data",1));
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message, -1));
    }

}

const addDisease = async (req, res) => {
    
    const data = req.body;
    const uid = data.doctorId;

    const symptoms = JSON.parse( JSON.stringify(data.symptoms));
    // console.log("Diseae: "+ data.disease + " Symptoms: " + symptoms + " Doctor id: " + data.doctorId)

    try{
        let doctorDisease = await firestore.collection('doctorsAddedDiseases').doc(uid).get();
        await firestore.collection('deductiveKB').doc(data.disease).set({Symptom: symptoms});
        if(!doctorDisease.exists){
            await firestore.collection('doctorsAddedDiseases').doc(uid).set({diseases: [data.disease]});
        }else{
            let diseases = doctorDisease.data().diseases;
            diseases.push(data.disease)
            // console.log(diseases)
            await firestore.collection('doctorsAddedDiseases').doc(uid).set({diseases: diseases});
        }
        res.status(200).send(new ResponseMsg("Successfully added new disease",1));
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message, -1));
    }
}


module.exports = {
    addDataSet,
    addDisease
}