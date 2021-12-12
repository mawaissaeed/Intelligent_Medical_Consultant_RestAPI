'use strict';

const firebase = require('firebase');
const InductiveCase = require('../models/inductiveCase');
const firestore = firebase.firestore();
const Symptom = require('../models/symptom');
const ResponseMsg = require('../models/responseMsg');



const addCase = async (req, res) => {

    const data = req.body;
    const uid = req.uid;

    let symptomList = [];


     const result = await updateCase(uid,data);
    
     if(result['code'] == -1){
        // if(true){
        for (let symptom of data.symptoms) {
            let symptomObject = new Symptom(symptom);
            symptomList.push(symptomObject);
          }
    
        const inductiveCase = new InductiveCase(
            data.disease,
            symptomList,
            1,
            0,
            new Date(),
            new Date()
    
        );
        const caseData = JSON.parse( JSON.stringify(inductiveCase));
        try{
        await firestore.collection('inductiveKB').doc(uid).collection('Cases').doc(data.disease).set({inductiveCase: caseData});
        // await firestore.collection('doctorsCases').doc(data.disease).set({doctorsIds:[uid]});
        res.status(200).send(new ResponseMsg("Successfully added new case",1));
        }catch(error){
            res.status(400).send(new ResponseMsg(error.message, -1));
        }
    
    }else{
        res.status(200).send(new ResponseMsg(result['msg'], result['code']));
    }
    
}

// const addCase = async (req, res) => {

//         const data = req.body;
//         const uid = req.uid;

//         const inductiveCase = new InductiveCase(
//             uid,
//             data.disease,
//             data.symptoms,
//             1,
//             0,
//             new Date(),
//             new Date()

//         );
//         const caseData = JSON.parse( JSON.stringify(inductiveCase));
//         // console.log(data);
//             // console.log(JSON.parse( JSON.stringify(inductiveCase)));
//         const result = await updateCase(uid,data);
        
//         if(result['code'] == -1){
//             await firestore.collection('inductiveKBCases').add({inductiveCase: caseData}).then(async(d) =>{
//                 console.log(d.id);
//                 await firestore.collection('doctorsCases').doc(d.id).set({doctorsIds:[uid]});
//                 res.status(200).send("Successfully added new case");
//             }).catch(error =>{
//                 res.status(400).send({error: error.message});
//             });
        
//         }else{
//             res.status(200).send(result['msg']);
//         }
        
// }
// const getAllDoctors = async (req,res,next)=> {
//     try{
//         const doctors = await firestore.collection('doctors');
//         const data = await doctors.get();
//         const doctorsArray = []

//         if(data.empty){
//             res.status(404).send('No doctor record found');
//         }else{
//             data.forEach(doc => {
//                 const doctor = new Doctor(
//                     doc.id,
//                     doc.data().firstName,
//                     doc.data().lastName,
//                     doc.data().emailAddress,
//                     doc.data().upin

//                 );
//                 doctorsArray.push(doctor);
//             });
//             res.send(doctorsArray);
//         }
//     }catch(error){
//         res.status(400).send(error.message);
//     }
// }


function matchDiseaseSymptoms(inductiveCases,disease) {

    for(let Case of inductiveCases){
        if(disease === JSON.stringify(Case.disease)){
            return Case;
        }
    }
    return -1;
    
}


async function updateCase(id,data) {
    try{
    
        let symptoms = data['symptoms'];
        let disease = data['disease'];

        let inductiveKBRef = await firestore.collection('inductiveKB').doc(id).collection('Cases').doc(disease);
        return firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(inductiveKBRef).then((doc) => {
                if (!doc.exists) {
                    throw "Case Document does not exist!";
                }
                
                const symptomsList = doc.data().inductiveCase.symptoms;                    
                for(let symptom of symptomsList){
                    if(symptoms.includes(symptom.name)){
                        // console.log(symptom.name,symptoms)
                        symptom.weight = symptom.weight + 1;
                        // updatedSymptomsList.push(symptom);
                        symptoms = symptoms.filter(item => item !== symptom.name);
                    }
                }
                // console.log(symptomsList)
                if(!symptoms.empty){
                    for(let symptom of symptoms){
                        let newSymptom = new Symptom(symptom);
                        symptomsList.push(newSymptom);
                    }
                }     
                transaction.update(inductiveKBRef, { 'inductiveCase.symptoms': JSON.parse( JSON.stringify(symptomsList)) }, {merge: true});
                transaction.update(inductiveKBRef, { 'inductiveCase.updateDate': new Date() }, {merge: true});
                
            });
        }).then(() => {
            console.log("New symptoms added to case successfuly! -> weight++!");
            // res.status(200).send('Case updated successfuly! -> weight++');
            return ({msg: 'New symptoms added to case successfuly! -> weight++', code: 1});
            
        }).catch((error) => {
            console.log("Transaction failed: ", error);
            return {msg: error, code: -1};
            // res.status(400).send({error});
        });
        
        
    }catch(error){
        console.log(error.message);
        return {error: error.message, code: -2};
        // res.status(400).send(error.message);
    }
}

// const getCases = async (req,res,next)=> {
//     let select = req.body['symptoms'];
//     try{
//         const id = req.params.id;
//         const cases = await firestore.collection('inductiveKB').doc(id).collection('Cases').where("case.Symptoms", "array-contains-any", select);
//         const data = await cases.get();

//         const casesArray = []

//         if(data.empty){
//             res.status(404).send(new ResponseMsg('Cases with the given ID not found', -1));
//         }else{
//             data.forEach(doc => {
//                 casesArray.push(doc.data());
//             });
//             res.status(200).send(casesArray);
//         }
//     }catch(error){
//         res.status(400).send(new ResponseMsg(error.message, -1));
//     }
// }

module.exports = {
    addCase,
    updateCase
}