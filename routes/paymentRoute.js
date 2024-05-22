import express from 'express'
import { createPayment, paymentVerification } from '../controllers/paymentController.js';

const router=express.Router();

router.post('/createpayment',createPayment)
router.post('/verifypayment',paymentVerification)

export default router;

