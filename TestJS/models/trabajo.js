const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorieShema = new Schema({
    id: {
        type: Number,
    },
    idCategory: {
        type: Number,
    },
    title: {
        type: String,
    },
    descr: {
        type: String,
    }

});


module.exports = mongoose.model('trabajo', categorieShema);