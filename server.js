const express = require('express');
const cartController=require("./controllers/cartController")
const productController = require('./controllers/ProductController');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const authMiddleware=require("./middlewares/authMiddleware")
const userController=require('./controllers/userController');
const roleMiddleware=require("./middlewares/roleMiddleware")
const MongoStore = require('connect-mongo');
const fs = require('fs')
const multer = require('multer')
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_ultra_securisee',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false 
    }
}));


app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/products', require('./routes/productRoutes'));


app.get("/register", userController.getRegisterPage);
app.get("/login", userController.getLoginPage);
app.get("/user/home", productController.getAllProducts);
app.get("/user/product/:id", productController.getProductDetails);
app.get("/user/cart", authMiddleware,cartController.getCartView);
app.get("/user/profile", authMiddleware, userController.getProfile);
app.get("/admin/users", authMiddleware, roleMiddleware, userController.getAllUsers);
app.get('/admin/products', authMiddleware, roleMiddleware, productController.getProductsPage);
app.get('/admin/products/new', authMiddleware, roleMiddleware, productController.getAddProductPage);
app.get('/admin/products/:id/edit', authMiddleware, roleMiddleware, productController.getEditProductPage);

app.get('/', (req, res) => {
    res.render('index');
});
app.get("/logout", userController.logoutUser);
app.get("/admin/home", authMiddleware, roleMiddleware, (req, res) => {
    res.render("admin/home");
});



mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connecté');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
})
.catch(err => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1);
});