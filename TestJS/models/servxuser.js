const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorieShema = new Schema({
    idUser: {
        type: Number,
        //unique: true,
    },
    idServ: {
        type: Number,
    },
    price: {
        type: Number,
    }

});


module.exports = mongoose.model('servxuser', categorieShema);
