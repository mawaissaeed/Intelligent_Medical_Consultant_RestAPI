'use strict';

const firebase = require('firebase');
const Doctor = require('../models/doctor');
const ResponseMsg = require('../models/responseMsg');
const firestore = firebase.firestore();

const addDoctor = async (req, res, next) => {

    const data = req.body;
    const uid = req.uid;
    try{
        await firestore.collection('doctors').doc(uid).set(data);
        res.status(200).send(new ResponseMsg('Record saved successfully',1));
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const getAllDoctors = async (req,res,next)=> {
    try{
        const doctors = await firestore.collection('doctors');
        const data = await doctors.get();
        const doctorsArray = []
        if(data.empty){
            res.status(404).send(new ResponseMsg('No doctor record found',-1));
        }else{
            data.forEach(doc => {
                const doctor = new Doctor(
                    doc.id,
                    doc.data().fullName,
                    doc.data().emailAddress,
                    doc.data().regNo,
                    doc.data().city,
                    doc.data().phoneNo
                );
                doctorsArray.push(doctor);
            });
            res.send(doctorsArray);
        }
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const getDoctor = async (req,res,next)=> {
    try{
        const id = req.params.id;
        const doctor = await firestore.collection('doctors').doc(id);
        const data = await doctor.get();
        if(!data.exists){
            res.status(404).send(new ResponseMsg('Doctor with the given ID not found',-1));
        }else{
            res.status(200).send(data.data());
        }
    }catch(error){
        res.status(400).send(error.message);
    }
}

const updateDoctor = async (req,res,next)=> {
    try{
        const id = req.params.id;
        const data = req.body;
        const doctor = await firestore.collection('doctors').doc(id);
        await doctor.update(data);
        res.status(200).send(new ResponseMsg('Doctor record updated successfully', 1));
        
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const deleteDoctor = async (req,res,next)=> {
    try{
        const id = req.params.id;
        await firestore.collection('doctors').doc(id).delete();
        res.status(200).send(new ResponseMsg('Doctor record deleted successfuly', 1));
        
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

module.exports = {
    addDoctor,
    getAllDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor
}