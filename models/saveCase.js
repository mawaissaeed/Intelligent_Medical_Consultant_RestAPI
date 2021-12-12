class SaveCase{
    constructor(disease, symptoms, mismatchedSymptoms, createDate, updateDate){
        this.disease = disease;
        this.symptoms = symptoms;
        this.mismatchedSymptoms = mismatchedSymptoms;
        this.createDate = createDate;
        this.updateDate = updateDate;

    }
}

module.exports = SaveCase;