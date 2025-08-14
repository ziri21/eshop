const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const multer = require('multer');
const path = require('path');

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes d'administration - Ordre important
router.get('/admin/products', authMiddleware, roleMiddleware, productController.getProductsPage);
router.get('/admin/products/new', authMiddleware, roleMiddleware, productController.getAddProductPage);

// Utilisez le middleware Multer pour gérer l'upload du fichier 'image'
router.post('/admin/products/new', authMiddleware, roleMiddleware, upload.single('image'), productController.createProduct);

router.get('/admin/products/:id/edit', authMiddleware, roleMiddleware, productController.getEditProductPage);

// Utilisez Multer pour la mise à jour si vous le souhaitez
router.put('/admin/products/:id', authMiddleware, roleMiddleware, upload.single('image'), productController.updateProduct);

router.delete('/admin/products/:id', authMiddleware, roleMiddleware, productController.deleteProduct);

// Routes générales (utilisateurs)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductDetails);

module.exports = router;