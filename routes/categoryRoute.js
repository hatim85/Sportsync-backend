import express from 'express'
import { updateimg,getCategory,createCategory,deleteCategory,updateCategory,getCategories, getCategoryProducts, getzeroindeximg } from '../controllers/categoryController.js'
import upload from '../utils/multer.js';

const router=express.Router();

router.put('/update/:categoryId',updateCategory);
router.delete('/delete/:categoryId',deleteCategory);
router.post('/create',createCategory);
router.get('/getcategory/:categoryId',getCategory);
router.get('/getAllcategory',getCategories);
router.get('/getcategoryproducts/:categoryId',getCategoryProducts);
router.put('/updateimg/:categoryId',upload.array("files",3),updateimg);
router.get('/getzeroimg',getzeroindeximg)

export default router