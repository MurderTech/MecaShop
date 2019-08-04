const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorieShema = new Schema({
    id: {
        type: Number,
        //unique: true,
    },
    title: {
        type: String,
    },
    desc: {
        type: String,
    },

});


module.exports = mongoose.model('service', categorieShema);
