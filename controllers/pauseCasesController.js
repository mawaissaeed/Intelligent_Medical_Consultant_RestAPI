'use strict';

const firebase = require('firebase');
const SaveCase = require('../models/saveCase');
const firestore = firebase.firestore();
const Symptom = require('../models/symptom');
const ResponseMsg = require('../models/responseMsg');

const addCase = async (req, res) => {

    const data = req.body;
    const uid = req.uid;
    const phone = data.phone;    

    let symptomList = [];

    for (let symptom of data.symptoms) {
        let symptomObject = new Symptom(symptom);
        symptomList.push(symptomObject);
        }

    const saveCase = new SaveCase(
        data.disease,
        symptomList,
        data.mismatch,
        new Date(),
        new Date()
    );
    const caseData = JSON.parse( JSON.stringify(saveCase));
    try{
    await firestore.collection('pauseCases').doc(phone).set({saveCase: caseData})
    res.status(200).send(new ResponseMsg("Successfully added new case",1));
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message, -1));
    }
    
}

const getCase = async (req,res,next)=> {
    let phone = req.body['phone'];
    try{
        const cases = await firestore.collection('pauseCases').doc(phone);
        const data = await cases.get();

        if(!data.exists){
            res.status(404).send(new ResponseMsg('Case with the given ID not found', -1));
        }else{
            res.status(200).send(data.data());
        }
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message, -1));
    }
}

const deleteCase = async (req,res,next)=> {
    try{
        const phone = req.body['phone'];
        await firestore.collection('pauseCases').doc(phone).delete();
        res.status(200).send(new ResponseMsg('Case record deleted successfuly', 1));
        
    }catch(error){
        res.status(400).send(error.message);
    }
}

module.exports = {
    addCase,
    getCase,
    deleteCase
}