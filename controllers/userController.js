const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product=require('../models/Product')


exports.getRegisterPage = (req, res) => {
    res.render("auth/register");
};

exports.getLoginPage = (req, res) => {
    const error = req.query.error; // Récupère le message d'erreur de l'URL
    res.render("auth/login", { error });
};

exports.getDashboardPage = async (req, res) => {
    try {
        const products = await Product.find();
        res.render("user/home", { user: req.session.user, products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur du serveur.");
    }
};

exports.registerUser = async (req, res) => {
    console.log("📩 Tentative d'inscription...");

    try {
        // 🔍 Vérifier ce qui est reçu
        console.log("Données reçues :", req.body);

        const { username, email, password, role } = req.body;

        // Vérifier si tous les champs sont présents
        if (!username || !email || !password || !role) {
            console.log("❌ Champs manquants");
            return res.status(400).send("Tous les champs sont obligatoires");
        }

        // Vérifier si l'email ou le username existe déjà
        let existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        console.log("Utilisateur existant :", !!existingUser);

        if (existingUser) {
            console.log("⚠ L'email ou le nom d'utilisateur existe déjà");
            return res.redirect("/register?error=user_exists");
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔑 Mot de passe haché");

        // Créer un nouvel utilisateur
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });
        console.log("✅ Nouvel utilisateur créé :", newUser._id);

        // Enregistrer l'utilisateur en session
        req.session.user = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        };

        // 🔹 Redirection selon le rôle
        if (newUser.role === "admin") {
            console.log("👤 Admin connecté, redirection vers /admin/home");
            return res.redirect("/admin/home");
        } else {
            console.log("👤 Utilisateur connecté, redirection vers /user/home");
            return res.redirect("/user/home");
        }

    } catch (err) {
        console.error("💥 Erreur d'inscription :", err);
        return res.status(500).send("Erreur du serveur : " + err.message);
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect("/login?error=invalid_credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect("/login?error=invalid_credentials");
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // 🔹 Redirection selon le rôle
        if (user.role === "admin") {
            return res.redirect("/admin/home");
        } else {
            return res.redirect("/user/home");
        }

    } catch (err) {
        console.error(err.message);
        return res.redirect("/login?error=server_error");
    }
};


exports.getProfile = async (req, res) => {
    try {
        const utilisateur = await User.findById(req.session.user.id);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        res.render("user/profile", { utilisateur });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/admin/users"); // mettre / pour chemin absolu
    } catch (err) {
        console.error(err);
        res.redirect("/admin/users");
    }
};



exports.updateUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
        res.redirect('/admin/users'); // retourne vers la liste après modification
    } catch (err) {
        console.error(err);
        res.redirect('/admin/users');
    }
};



exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non retrouvé" });
        res.status(200).json({ message: "Voici l'utilisateur recherché", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Erreur de déconnexion.");
        }
        res.redirect("/login");
    });
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.render("admin/users", { users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.editUserForm = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect("/admin/users"); 
        }
        res.render("admin/editUser", { user });
    } catch (err) {
        console.error(err);
        res.redirect("/admin/users");
    }
};
