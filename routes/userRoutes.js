const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logoutUser);

router.get('/profile',authMiddleware, userController.getProfile);

// Routes d'administration - placez les plus spécifiques en premier
router.get('/admin/users/:id/edit', authMiddleware, roleMiddleware, userController.editUserForm);
router.put('/admin/users/:id', authMiddleware, roleMiddleware, userController.updateUser);
router.get("/admin/users",authMiddleware, roleMiddleware, userController.getAllUsers);

// Routes générales - placez-les après les routes spécifiques
router.get('/:id', authMiddleware, roleMiddleware, userController.getUser);
router.delete('/:id', authMiddleware, roleMiddleware, userController.deleteUser);
router.get('/', authMiddleware, roleMiddleware, userController.getAllUsers);

module.exports = router;