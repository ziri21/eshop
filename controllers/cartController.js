const Cart = require('../models/Cart');
const Product = require('../models/Product');


exports.addToCart = async (req, res) => {
    try {
     
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Non authentifié" });
        }

        const userId = req.user.id;
        const { product, quantity } = req.body;

     
        if (!product || !quantity || quantity < 1) {
            return res.status(400).json({ msg: "Produit et quantité valide requis" });
        }

        
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).json({ msg: "Produit introuvable" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
       
            cart = new Cart({
                user: userId,
                items: [{ product, quantity }],
                totalPrice: productData.price * quantity
            });
        } else {
  
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === product
            );

            if (itemIndex > -1) {
                
                cart.items[itemIndex].quantity += quantity;
            } else {
                
                cart.items.push({ product, quantity });
            }

           
            let total = 0;
            for (const item of cart.items) {
                const p = await Product.findById(item.product);
                total += p.price * item.quantity;
            }
            cart.totalPrice = total;
        }

        await cart.save();

         res.redirect("/user/cart");
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


exports.getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return res.status(404).json({ message: "Panier vide" });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mise à jour de la fonction `removeFromCart`
exports.removeFromCart = async (req, res) => {
    const userId = req.user.id;
    // Note: Le productId est maintenant dans le corps de la requête pour les formulaires
    const { productId } = req.params; 

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.redirect('/user/cart');

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        // ... (logique de recalcul du total) ...
        await cart.save();
        
        // Redirection vers le panier après la suppression
        res.redirect('/user/cart'); 
    } catch (err) {
        console.error(err);
        res.redirect('/user/cart');
    }
};

// Mise à jour de la fonction `clearCart`
exports.clearCart = async (req, res) => {
    const userId = req.user.id;
    try {
        await Cart.findOneAndDelete({ user: userId });
        
        // Redirection vers le panier après avoir vidé
        res.redirect('/user/cart');
    } catch (err) {
        console.error(err);
        res.redirect('/user/cart');
    }
};


exports.getCartView = async (req, res) => {
  const userId = req.user.id;

  try {
   
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    
    const panierItems = cart ? cart.items : [];
    const totalPrice = cart ? cart.totalPrice : 0;

    res.render('user/cart', { panier: panierItems, totalGeneral: totalPrice });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur du serveur lors de l\'affichage du panier.');
  }
};