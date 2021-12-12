'use strict';

const firebase = require('firebase');
const firestore = firebase.firestore();
const ResponseMsg = require('../models/responseMsg')


const getMatchingDiseases = async (req, res, next) =>{
    let select = req.body['symptoms'];
    let uid = req.uid;
    let cases = [];
    let dict=[];
    try{
        const querySnapshot = await firestore.collection('inductiveKB').doc(uid).collection('Cases').get();
        if(querySnapshot.empty){
            res.status(404).send(new ResponseMsg('This doctor does not have inductive case.',-1));
        }

        querySnapshot.forEach(doc => {
            const symptoms = doc.data().inductiveCase.symptoms;
            if(symptomsMatching(select,symptoms)){
                const disease = doc.id;
                const temp={};
                temp[disease]=symptoms;
                temp['degree']=findMatchDegree(select,symptoms);
                dict.push(temp);
            }
        });
        res.status(200).send(dict);
    }
catch(error){
     res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

function symptomsMatching(enteredSymptoms,actualSymptoms){
    for(let symptom of actualSymptoms){
        if(enteredSymptoms.includes(symptom.name)){
            return true;
        }
    }
    return false;
}
function findMatchDegree(enteredSymptoms,actualSymptoms){
    // const found = enteredSymptoms.filter( (val) => actualSymptoms.includes(val) );
    const found = [];
    for(let symptom of actualSymptoms){
        if(enteredSymptoms.includes(symptom.name)){
            found.push(symptom)
        }
    }
    
    return [found,(((found.length - (enteredSymptoms.length - found.length))/actualSymptoms.length)*100).toPrecision(4)];
  }


module.exports = {
    getMatchingDiseases
}