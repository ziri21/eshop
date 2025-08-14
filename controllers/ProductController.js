const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
exports.createProduct = async (req, res) => {
    const { name, price, description } = req.body;
    let imagePath = '';

    // Vérifiez si un fichier a été téléchargé
    if (req.file) {
        imagePath = '/uploads/' + req.file.filename;
    }

    try {
        const newProduct = new Product({ name, price, description, image: imagePath });
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (err) {
        // En cas d'erreur, supprimez l'image téléchargée
        if (req.file) {
            fs.unlinkSync(path.join(__dirname, '../public', imagePath));
        }
        console.error(err.message);
        res.redirect(`/admin/products?error=${encodeURIComponent(err.message)}`);
    }
};
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('user/home', { products });
    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { message: 'Erreur du serveur.' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('404', { message: 'Produit non trouvé.' });
        }
        res.render('user/product-details', { produit: product });
    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { message: 'Erreur du serveur.' });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, price, description } = req.body;
    
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('404', { message: 'Produit non trouvé.' });
        }

        // Si une nouvelle image est téléchargée
        if (req.file) {
            // Supprime l'ancienne image si elle existe
            if (product.image) {
                const oldImagePath = path.join(__dirname, '..', 'public', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Définit le nouveau chemin de l'image
            product.image = `/uploads/${req.file.filename}`;
        }

        // Met à jour les autres champs
        product.name = name;
        product.price = price;
        product.description = description;

        await product.save();
        res.redirect(`/admin/products`);
    } catch (err) {
        // En cas d'erreur de validation, on gère la suppression de la nouvelle image
        if (req.file) {
            const newImagePath = path.join(__dirname, '..', 'public', `/uploads/${req.file.filename}`);
            if (fs.existsSync(newImagePath)) {
                fs.unlinkSync(newImagePath);
            }
        }
        console.error(err.message);
        res.redirect(`/admin/products?error=${encodeURIComponent(err.message)}`);
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('404', { message: 'Produit non trouvé.' });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.redirect('/products');
    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { message: 'Erreur du serveur.' });
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const produit = await Product.findById(req.params.id);
        if (!produit) {
            return res.status(404).render('404', { message: 'Produit non trouvé.' });
        }
        res.render('user/product-details', { product: produit });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Erreur du serveur.' });
    }
};
exports.getProductsPage = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur du serveur.');
    }
};

// Affiche la page pour ajouter un nouveau produit
exports.getAddProductPage = (req, res) => {
    res.render('admin/addProduct');
};

// Affiche la page pour modifier un produit
exports.getEditProductPage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.redirect('/admin/products');
        }
        res.render('admin/editProduct', { product });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};