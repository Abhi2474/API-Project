import express from 'express';
import { loginController, registerController, userController, refreshController, productController } from '../controllers';
import admin from '../middlewares/admin';
import auth from '../middlewares/auth';
import login from '../middlewares/login';
const router = express.Router()

router.post('/register', registerController.register)
router.post('/login', loginController.login)
router.get('/me', auth, userController.me)
router.post('/refresh', refreshController.refresh)
router.post('/logout', auth, loginController.logout)

router.post('/products/cart-items', productController.getProducts);

router.post('/products', [auth, admin], productController.store);
router.put('/products/:id', [auth, admin], productController.update);
router.delete('/products/:id', [auth, admin], productController.destroy);
router.get('/products', productController.index);
router.get('/products/:id', productController.show);

// to check with login authentication making this to post request
router.post('/productslogin',login, productController.index);


export default router