const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSC = new Schema({
    id: {
        type: Number,
        //unique: true,
        //require: [true, ['Id requerido']]
    },
    usuario: {
        type: String,
        //required: [true, ['Usuario requerido']]
    },
    pass: {
        type: String,
        //required: [true, ['Contraseña requerida']]
    },
    nombre: {
        type: String
    },
    typeAcc : {
        type: Number,
        //required: [true['Especifíque el tipo de cuenta']]
    },
    email : {
        type: String,
        //required: [true['Especifíque el tipo de cuenta']]
    }

});


module.exports = mongoose.model('usuario', userSC);