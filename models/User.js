const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Le nom d’utilisateur est obligatoire'],
       
        trim: true,
        minlength: [3, 'Le nom d’utilisateur doit contenir au moins 3 caractères'],
        maxlength: [30, 'Le nom d’utilisateur ne doit pas dépasser 30 caractères']
    },
    email: {
        type: String,
        required: [true, 'L’email est obligatoire'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer un email valide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user'],
            message: 'Le rôle doit être soit admin, soit user'
        },
        default: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
