'use strict';

const firebase = require('firebase');
const  config  = require('../config');
const firestore = firebase.firestore();

const ResponseMsg = require('../models/responseMsg');


const getAllSymptoms = async (req,res,next)=> {

    try{
        const symptoms = await firestore.collection('deductiveKB');
        const data = await symptoms.get();
        let symptomsArray = []
        const symptomsList = []
        if(data.empty){
            res.status(404).send(new ResponseMsg('No symptom record found',-1));
        }else{
            data.forEach(doc => {
                for(let symptom of doc.data().Symptom){
                    symptomsArray.push(symptom);                   
                }
            });
            symptomsArray = [...new Set(symptomsArray)];
            console.log("total symptoms: "+symptomsArray.length)
            for(let symptom of symptomsArray){
                symptomsList.push({"name": symptom});                   
            }
            res.status(200).send(symptomsList);
        }
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const getMatchingDiseases = async (req, res, next) =>{
    let select = req.body['symptoms'];
    let dict=[];
    try{
        const querySnapshot = await firestore.collection('deductiveKB').where("Symptom", "array-contains-any", select).get();

        if(querySnapshot.empty){
            res.status(404).send(new ResponseMsg('No symptom record found',-1));
        }else{
            querySnapshot.forEach(doc => {
            const data = doc.data().Symptom;
            const Disease = doc.id;
            const temp={};
            temp[Disease]=data;
            temp['degree']=findMatchDegree1(select,data)
            dict.push(temp)});
        res.status(200).send(dict);
        }
    }
catch(error){
     res.status(400).send(new ResponseMsg(error.message,-1));
    }
}



const getDifferentialDiagnosis = async (req, res, next) =>{
    let select = req.body['symptoms'];
    let uid = req.uid;
    let deductiveDict=[];
    let inductiveDict=[];
    let abductiveDict= [];
    let highlight = 0;
    let result = [];
    try{
        const querySnapshot1 = await firestore.collection('deductiveKB').where("Symptom", "array-contains-any", select).get();
        if(querySnapshot1.empty){
           return res.status(404).send(new ResponseMsg('No symptom record found',-1));
        }else{
            querySnapshot1.forEach(doc => {
            const data = doc.data().Symptom;
            const Disease = doc.id;
            const temp={};
            temp[Disease]=data;
            temp['degree']=findMatchDegree1(select,data);
            if(temp['degree'][1] > 0){
                deductiveDict.push(temp)
                }
             });

            deductiveDict.sort((a, b) => b['degree'][1] - a['degree'][1]);       
        }
        deductiveDict = deductiveDict.slice(0,10);
        if(deductiveDict.length != 0){
            highlight = 1
        } 
        result.push({Deductive: deductiveDict});

        const querySnapshot2 = await firestore.collection('inductiveKB').doc(uid).collection('Cases').get();
        if(querySnapshot2.empty){
            // res.status(404).send(new ResponseMsg('This doctor does not have inductive case.',-1));
            console.log(new ResponseMsg('This doctor does not have inductive case.',-1));
            // return res.status(200).send(result);
        }else{
            querySnapshot2.forEach(doc => {
                const symptoms = doc.data().inductiveCase.symptoms;
                if(symptomsMatching(select,symptoms)){
                    const disease = doc.id;
                    const temp={};
                    temp[disease]=symptoms;
                    temp['degree']=findMatchDegree2(select,symptoms);
                    if(temp['degree'][1] > 0){
                        inductiveDict.push(temp);
                    }
                }
            });
            inductiveDict.sort((a, b) => b['degree'][1] - a['degree'][1]);
        }
        inductiveDict = inductiveDict.slice(0,10);
        if(inductiveDict.length != 0 && highlight == 1){
            if(parseFloat(inductiveDict[0]['degree'][1])> parseFloat(deductiveDict[0]['degree'][1])){
                highlight = 2;
            }
        } 
        result.push({Inductive: inductiveDict});

        const friends = await firestore.collection('doctorsPanel').doc(uid).get();
        if(!friends.exists){
            // res.status(404).send(new ResponseMsg('Doctor with the given ID not found',-1));
            console.log(new ResponseMsg('Doctor with the given ID not found',-1));
        }else{
            let doctorsUids = friends.data().doctorsIds;
            if(doctorsUids.length == 0){
                // res.status(404).send(new ResponseMsg('Does not have any friend',-1));
                console.log(new ResponseMsg('Doctor with the given ID not found',-1));
            }else{

            //    await doctorsUids.forEach( async (id) =>{
                for(let id of doctorsUids){
                    
                    const querySnapshot3 = await firestore.collection('inductiveKB').doc(id).collection('Cases').get();
                    if(querySnapshot3.empty){
                        // res.status(404).send(new ResponseMsg('This doctor does not have inductive case.',-1));
                        console.log(new ResponseMsg('Doctor with this id: '+id+' does not have inductive case.',-1));
                        // res.status(200).send(result);
                    }else{
                        
                        querySnapshot3.forEach(doc => {
                            
                            const symptoms = doc.data().inductiveCase.symptoms;
                            if(symptomsMatching(select,symptoms)){
                                const disease = doc.id;
                                const temp={};
                                temp[disease]=symptoms;
                                temp['degree']=findMatchDegree2(select,symptoms);
                                if(temp['degree'][1] > 0){
                                    if(abductiveDict.length != 0){
                                        for(let Case of abductiveDict){
                                            if(Object.keys(Case)[0] == doc.id && parseFloat(Case['degree'][1]) >= temp['degree'][1]){
                                                console.log("R: "+Object.keys(Case)[0] +" "+Case['degree'][1]+" "+ temp['degree'][1]);
                                                break;
                                            }else{

                                                abductiveDict = abductiveDict.filter(item => Object.keys(item)[0] !== doc.id);                                            
                                                abductiveDict.push(temp);
                                                break;
                                            }
                                        }

                                    }else{
                                        abductiveDict.push(temp);
                                    }
                                }
                            }                        
                        });
                    }

                }
                abductiveDict.sort((a, b) => b['degree'][1] - a['degree'][1]);
            }
        }
        abductiveDict = abductiveDict.slice(0,10);

        if(abductiveDict.length != 0 && highlight == 1){
            if(parseFloat(abductiveDict[0]['degree'][1])> parseFloat(deductiveDict[0]['degree'][1])){
                highlight = 3;
            }
        }else if(abductiveDict.length != 0 && highlight == 2){
            if(parseFloat(abductiveDict[0]['degree'][1])> parseFloat(inductiveDict[0]['degree'][1])){
                highlight = 3;
            }
        } 

        if(highlight == 3){
            result.push({Abductive: abductiveDict});
        }else{
            result.push({Abductive: []});
        }

        result.push({Highlight: highlight});
        return res.status(200).send(result);
    }
catch(error){
     res.status(400).send(new ResponseMsg(error.message,-1));
    }
}


function findMatchDegree1(enteredSymptoms,actualSymptoms){
    const found = enteredSymptoms.filter( (val) => actualSymptoms.includes(val) )
    // console.log("match length",found.length)
    // console.log("matching %",(found.length - (enteredSymptoms.length - found.length))/actualSymptoms.length)
    return [found,(((found.length - (enteredSymptoms.length - found.length))/actualSymptoms.length)*100).toPrecision(4)]
  }


function symptomsMatching(enteredSymptoms,actualSymptoms){
    for(let symptom of actualSymptoms){
        if(enteredSymptoms.includes(symptom.name)){
            return true;
        }
    }
    return false;
}
function findMatchDegree2(enteredSymptoms,actualSymptoms){
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
    getAllSymptoms,
    getMatchingDiseases,
    getDifferentialDiagnosis
    
}