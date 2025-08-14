const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est obligatoire'],
        trim: true,
        minlength: [2, 'Le nom du produit doit contenir au moins 2 caractères'],
        maxlength: [100, 'Le nom du produit ne doit pas dépasser 100 caractères']
    },
    price: {
        type: Number,
        required: [true, 'Le prix est obligatoire'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères'],
        maxlength: [1000, 'La description ne doit pas dépasser 1000 caractères']
    },
    image: {
        type: String,
        trim: true,
        // Validation personnalisée pour accepter les chemins d'upload et les URLs
        validate: {
            validator: function(v) {
                // Si la valeur est vide, on la considère comme valide (l'image n'est pas obligatoire)
                if (!v) {
                    return true;
                }
                const localPathRegex = /^\/uploads\/.+\.(jpg|jpeg|png|webp|gif)$/i;
                const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;
                return localPathRegex.test(v) || urlRegex.test(v);
            },
            message: props => `${props.value} n'est pas une image valide !`
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);