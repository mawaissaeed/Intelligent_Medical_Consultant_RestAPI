'use strict';

const firebase = require('firebase');
const firestore = firebase.firestore();
const Doctor = require('../models/doctor');
const ResponseMsg = require('../models/responseMsg');


const followDoctorRequest = async (req, res, next) => {
    const data = req.body;
    const uid = req.uid;
    const result = await updateNotification(uid,data["uid"]);
    if(result == -1){
        try{
            await firestore.collection('notifications').doc(data["uid"]).set({doctorsIds:[uid]});
            res.status(200).send(new ResponseMsg('Request sent successfully',1));
        }catch(error){
            res.status(400).send(new ResponseMsg(error.message,-1));
        }
    }else if(result == -2){
        res.status(400).send(new ResponseMsg('You already sent a request',-2));
    }else if(result == 1){
        res.status(200).send(new ResponseMsg('Request sent successfully',1));
    }else{
        res.status(400).send(new ResponseMsg(result['msg'],result['code']));
    }
    
}

async function updateNotification(senderId,reciverId) {
    try{
        const notifications = await firestore.collection('notifications').doc(reciverId).get();
        if(!notifications.exists){
            return -1;
        }        
        let doctorsIds = notifications.data().doctorsIds;
        if(doctorsIds.includes(senderId)){
            return -2;
        }

        let ref = await firestore.collection('notifications').doc(reciverId);
        return firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(ref).then((doc) => {
                if (!doc.exists) {
                    throw "Request does not exist!";
                }
            
                 var newCase = doc.data().doctorsIds;
                 newCase.push(senderId);
                //  console.log(newCase);
                transaction.update(ref, { doctorsIds: newCase }, {merge: true});
            });
        }).then(() => {
            return 1;
        }).catch((error) => {
            console.log("Transaction failed: ", error);
        });
   
    }catch(error){
        console.log(error.message);
        return {msg: error.message, code: -1};
    }
}

const acceptRequest = async (req,res,next)=> {
    try{
        const reciverId = req.uid;
        const senderId = req.body["uid"];
        const result1 = await deleteNotification(senderId,reciverId);
        if(result1 == 1){
            const result2 = await updateDoctorsPanel(senderId,reciverId);
            if(result2 == -1){
                await firestore.collection('doctorsPanel').doc(senderId).set({doctorsIds:[reciverId]});
                await firestore.collection('doctorsPanel').doc(reciverId).set({doctorsIds:[senderId]});
                res.status(200).send(new ResponseMsg('Request accepted successfuly',1));
            }else if(result2 == -2){
                await firestore.collection('doctorsPanel').doc(senderId).set({doctorsIds:[reciverId]});
                res.status(200).send(new ResponseMsg('Request accepted successfuly',1));
            }else if(result2 == -3){
                await firestore.collection('doctorsPanel').doc(reciverId).set({doctorsIds:[senderId]});
                res.status(200).send(new ResponseMsg('Request accepted successfuly',1));
            }else if(result2 == 1){
                res.status(200).send(new ResponseMsg('Request accepted successfuly',1));
            }else{
                res.status(200).send(new ResponseMsg(result2['msg'],result2['code']));
            }            
        }else{
            res.status(200).send(new ResponseMsg(result1['msg'],result1['code']));
        }        
        
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

async function deleteNotification(senderId,reciverId) {
    try{

        let ref = await firestore.collection('notifications').doc(reciverId);
        return firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(ref).then((doc) => {
                if (!doc.exists) {
                    throw "Request does not exist!";
                }            
                 var newCase = doc.data().doctorsIds;
                 newCase = newCase.filter(item => item !== senderId);
                //  console.log(newCase);
                transaction.update(ref, { doctorsIds: newCase }, {merge: true});
            });
        }).then(() => {
            console.log("delete notification successfully")
            return 1;
        }).catch((error) => {
            console.log("Transaction failed: ", error);
        });
   
    }catch(error){
        console.log(error.message);
        return {msg: error.message, code: -1};
    }
}

async function updateDoctorsPanel(senderId,reciverId) {
    try{

        const doctorsPanel1 = await firestore.collection('doctorsPanel').doc(senderId).get();
        const doctorsPanel2 = await firestore.collection('doctorsPanel').doc(reciverId).get();
        if(!doctorsPanel1.exists && !doctorsPanel2.exists){
            return -1;
        }else if(!doctorsPanel1.exists){
            
            let ref = await firestore.collection('doctorsPanel').doc(reciverId);
            firestore.runTransaction((transaction) => {
                // This code may get re-run multiple times if there are conflicts.
            return  transaction.get(ref).then((doc) => {
                    if (!doc.exists) {
                        throw "Request does not exist!";
                    }
                
                    var newCase = doc.data().doctorsIds;
                    newCase.push(senderId);
                    //  console.log(newCase);
                    transaction.update(ref, { doctorsIds: newCase }, {merge: true});
                });
            }).then(() => {
                console.log("successfully updated reciver");
            }).catch((error) => {
                console.log("Transaction failed: ", error);
            });
            return -2;
        } 
        else if(!doctorsPanel2.exists){
            let ref = await firestore.collection('doctorsPanel').doc(senderId);
            firestore.runTransaction((transaction) => {
                // This code may get re-run multiple times if there are conflicts.
            return  transaction.get(ref).then((doc) => {
                    if (!doc.exists) {
                        throw "Request does not exist!";
                    }                
                    var newCase = doc.data().doctorsIds;
                    newCase.push(reciverId);
                    //  console.log(newCase);
                    transaction.update(ref, { doctorsIds: newCase }, {merge: true});
                });
            }).then(() => {
                console.log("successfully updated sender");
            }).catch((error) => {
                console.log("Transaction failed: ", error);
            });

            return -3;
        }else{
            let ref1 = await firestore.collection('doctorsPanel').doc(senderId);
            firestore.runTransaction((transaction) => {
                // This code may get re-run multiple times if there are conflicts.
            return  transaction.get(ref1).then((doc) => {
                    if (!doc.exists) {
                        throw "Request does not exist!";
                    }
                
                    var newCase = doc.data().doctorsIds;
                    newCase.push(reciverId);
                    //  console.log(newCase);
                    transaction.update(ref1, { doctorsIds: newCase }, {merge: true});
                });
            }).then(() => {
                console.log("successfully updated sender");
            }).catch((error) => {
                console.log("Transaction failed: ", error);
            });

            let ref2 = await firestore.collection('doctorsPanel').doc(reciverId);
            firestore.runTransaction((transaction) => {
                // This code may get re-run multiple times if there are conflicts.
            return  transaction.get(ref2).then((doc) => {
                    if (!doc.exists) {
                        throw "Request does not exist!";
                    }
                
                    var newCase = doc.data().doctorsIds;
                    newCase.push(senderId);
                    //  console.log(newCase);
                    transaction.update(ref2, { doctorsIds: newCase }, {merge: true});
                });
            }).then(() => {
                console.log("successfully updated reciver");
            }).catch((error) => {
                console.log("Transaction failed: ", error);
            });

            return 1;
        }         
   
    }catch(error){
        console.log(error.message);
        return {msg: error.message, code: -1};
    }
}


const searchDoctors = async (req,res,next)=> {
    try{

        const uid = req.uid;
        let doctors;
        let doctorsList = [];
        const doctorsPanel = await firestore.collection('doctorsPanel').doc(uid).get();
        if(!doctorsPanel.exists){
            console.log("Does not have any friend");
            doctors = await firestore.collection('doctors').get();
            doctors.forEach(doc => {
                // if(doc.id != uid){
                    const doctor = new Doctor(
                        doc.id,
                        doc.data().fullName,
                        doc.data().emailAddress,
                        doc.data().regNo,
                        doc.data().city,
                        doc.data().phoneNo
                    );
                    doctorsList.push(doctor);
                // }               
            });
            res.status(200).send(doctorsList);
        }else{
            doctors = await firestore.collection('doctors').get();
            doctors.forEach(doc => {
                if(!doctorsPanel.data().doctorsIds.includes(doc.id)){
                    const doctor = new Doctor(
                        doc.id,
                        doc.data().fullName,
                        doc.data().emailAddress,
                        doc.data().regNo,
                        doc.data().city,
                        doc.data().phoneNo

                    );
                    doctorsList.push(doctor);
                }               
            });
            res.status(200).send(doctorsList);
        }
        
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

// async function checkfollowers(senderId,reciverId) {
//     try{

//         let ref = await firestore.collection('notifications').doc(reciverId);
//         return firestore.runTransaction((transaction) => {
//             // This code may get re-run multiple times if there are conflicts.
//         return  transaction.get(ref).then((doc) => {
//                 if (!doc.exists) {
//                     throw "Request does not exist!";
//                 }            
//                  var newCase = doc.data().doctorsIds;
//                  newCase = newCase.filter(item => item !== senderId);
//                 //  console.log(newCase);
//                 transaction.update(ref, { doctorsIds: newCase }, {merge: true});
//             });
//         }).then(() => {
//             console.log("delete notification successfully")
//             return 1;
//         }).catch((error) => {
//             console.log("Transaction failed: ", error);
//         });
   
//     }catch(error){
//         console.log(error.message);
//         return {error: error.message, code: -1};
//     }
// }

const getAllFriends = async (req,res,next)=> {
    try{
        const id = req.uid;
        const friendsRef = await firestore.collection('doctorsPanel').doc(id);
        const friends = await friendsRef.get();
        let doctor;
        if(!friends.exists){
            res.status(404).send(new ResponseMsg('Does not have any friend',-1));
        }else{
            let doctorsUids = friends.data().doctorsIds;
            let doctorsList = [];
            if(doctorsUids.length == 0){
                res.status(404).send(new ResponseMsg('Does not have any friend',-1));
            }else{
                for(let uid of doctorsUids){
                    doctor = await firestore.collection('doctors').doc(uid).get();
                    const doc = new Doctor(
                        doctor.id,
                        doctor.data().fullName,
                        doctor.data().emailAddress,
                        doctor.data().regNo,
                        doctor.data().city,
                        doctor.data().phoneNo

                    );
                    doctorsList.push(doc);
                }
                res.status(200).send(doctorsList);
            }
        }
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const getAllRequests = async (req,res,next)=> {
    try{
        const id = req.uid;
        const requestsRef = await firestore.collection('notifications').doc(id);
        const requests = await requestsRef.get();
        let doctor;
        if(!requests.exists){
            res.status(404).send(new ResponseMsg('Request with the given ID not found',-1));
        }else{
            let doctorsUids = requests.data().doctorsIds;
            // console.log({doctorsUids})
            if(doctorsUids.length == 0){
                res.status(404).send(new ResponseMsg('Does not have any request',-1));
            }else{
                let doctorsList = [];
                for(let uid of doctorsUids){
                    doctor = await firestore.collection('doctors').doc(uid).get();
                    const doc = new Doctor(
                        doctor.id,
                        doctor.data().fullName,
                        doctor.data().emailAddress,
                        doctor.data().regNo,
                        doctor.data().city,
                        doctor.data().phoneNo

                    );
                    doctorsList.push(doc);
                }
                res.status(200).send(doctorsList);
            }           
        }
    }catch(error){
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}



const deleteRequest = async (req,res,next)=> {
    
    try{
        const senderId = req.body["uid"];
        const reciverId = req.uid;

        let ref = await firestore.collection('notifications').doc(reciverId);
        return firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(ref).then((doc) => {
                if (!doc.exists) {
                    throw "Request does not exist!";
                }            
                var newCase = doc.data().doctorsIds;
                newCase = newCase.filter(item => item !== senderId);
                transaction.update(ref, { doctorsIds: newCase }, {merge: true});
            });
        }).then(() => {
            console.log("delete notification successfully")
            res.status(200).send(new ResponseMsg('Request deleted successfuly',1));
        }).catch((error) => {
            console.log("Transaction failed: ", error);
            res.status(400).send(new ResponseMsg(error,-1));
        });
    
    }catch(error){
        console.log(error.message);
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

const deleteFriend = async (req,res,next)=> {
    const reciverId = req.uid; // user own uid
    const senderId = req.body['uid']; // friends uid
    let tempcount = 0;
    try{
        let ref1 = await firestore.collection('doctorsPanel').doc(senderId);
        firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(ref1).then((doc) => {
                if (!doc.exists) {
                    throw "Request does not exist!";
                }
            
                var newCase = doc.data().doctorsIds;
                // newCase.push(reciverId);
                newCase = newCase.filter(item => item !== reciverId);
                //  console.log(newCase);
                transaction.update(ref1, { doctorsIds: newCase }, {merge: true});
            });
        }).then(() => {
            console.log("successfully deleted sender");
            tempcount = tempcount + 1;
            console.log(tempcount)
            if(tempcount == 2){
                res.status(200).send(new ResponseMsg("Successfully deleted friend", 1));
            }
        }).catch((error) => {
            console.log("Transaction failed: ", error);
            res.status(400).send(new ResponseMsg(error,-1));
        });

        let ref2 = await firestore.collection('doctorsPanel').doc(reciverId);
        firestore.runTransaction((transaction) => {
            // This code may get re-run multiple times if there are conflicts.
        return  transaction.get(ref2).then((doc) => {
                if (!doc.exists) {
                    throw "Request does not exist!";
                }
            
                var newCase = doc.data().doctorsIds;
                // newCase.push(senderId);
                newCase = newCase.filter(item => item !== senderId);

                //  console.log(newCase);
                transaction.update(ref2, { doctorsIds: newCase }, {merge: true});
            });
        }).then(() => {
            console.log("successfully deleted reciver");
            tempcount = tempcount + 1;
            console.log(tempcount)
            if(tempcount == 2){
                res.status(200).send(new ResponseMsg("Successfully deleted friend", 1));
            }
        }).catch((error) => {
            console.log("Transaction failed: ", error);
            res.status(400).send(new ResponseMsg(error,-1));

        });
        

    }catch(error){
        console.log(error.message);
        res.status(400).send(new ResponseMsg(error.message,-1));
    }
}

module.exports = {
    followDoctorRequest,
    acceptRequest,
    searchDoctors,
    getAllFriends,
    deleteRequest,
    deleteFriend,
    getAllRequests
}