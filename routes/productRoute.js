import express from 'express'
import { getProduct, createProduct, deleteProduct, updateProduct, getProducts, getProductByName, getProductsByCategory, getCategoryByProduct, search, similarProduct, updateImages } from '../controllers/productController.js'
import upload from '../utils/multer.js';

const router = express.Router();

router.put('/update/:productId', upload.array('images', 3), updateProduct);
router.delete('/delete/:productId', deleteProduct);
router.post('/create', upload.array('imagees', 3), createProduct);
router.get('/getbyId/:productId', getProduct);
router.get('/getbyName/:productName', getProductByName);
router.get('/getAllproducts', getProducts);
router.get('/getProductsByCategory/:categoryId', getProductsByCategory);
router.get('/getProductCategory/:productId', getCategoryByProduct);
router.get('/search/:q', search);
router.get('/similar/:productId', similarProduct)
router.put('/updateimg/:productId', upload.array("files", 3), updateImages)

export default router