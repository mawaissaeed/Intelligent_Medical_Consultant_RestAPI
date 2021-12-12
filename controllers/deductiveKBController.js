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
module.exports = {
    addDataSet
}