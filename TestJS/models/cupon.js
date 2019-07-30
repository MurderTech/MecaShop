const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorieShema = new Schema({
    id: {
        type: Number,
        //unique: true,
        require: [true, 'El nombre es Necesario']
    },
    title: {
        type: String,
        required: [true, ['El titulo es Necesario']]
    },
    desc: {
        type: String,
        required: [true, ['La descripcion es Necesaria']]
    },
    param: {
        type: String
    },
    imagen: {
        type: String
    }

});


module.exports = mongoose.model('cupon', categorieShema);
