const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(authController.protect, userController.getAllUser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
