import express from 'express'
import { signup,signin, firebaseSignin, phoneSignin, checkUser, addPhone } from '../controllers/authController.js'

const router=express.Router();

router.post('/signup',signup);
router.post('/signin',signin);
router.post('/firebasesignin',firebaseSignin);
router.post('/phonesignin',phoneSignin);
router.post('/checkuser',checkUser);
router.post('/addphone',addPhone);

export default router;