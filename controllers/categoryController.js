import { errorHandler } from "../utils/error.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

// Create a new category
export const createCategory = async (req, res, next) => {
    const newCategory = new Category(req.body);
    try {
        const savedCategory = await newCategory.save();
        res.status(200).json(savedCategory);
    } catch (err) {
        next(err);
    }   
};

// Get all categories
export const getCategories = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 10; // Adjust as needed
        const skip = (page - 1) * pageSize;

        const categories = await Category.find()
            .skip(skip)
            .limit(pageSize);

        res.status(200).json(categories);
    } catch (err) {
        next(err);
    }
}

export const getAllCategories = async (req, res, next) => {
    try {
        // Fetch all categories, projecting only necessary fields
        const categories = await Category.find({}, '_id name image').exec();

        res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}

// Delete a category
export const deleteCategory = async (req, res, next) => {
    try {
        const deletedCategory=await Category.findByIdAndDelete(req.params.categoryId);
        const products=await Product.deleteMany({category:req.params.categoryId});
        if(deletedCategory && products){
            res.status(200).json(deletedCategory);
            res.status(201).json(products)
        }
    } catch (err) {
        next(err);
    }
}

// Get products within a category
export const getCategoryProducts = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.categoryId).populate('products');
        if (!category) {
            return next(errorHandler,(400,'Category not found'))
        }
        res.status(200).json(category.products);
    } catch (err) {
        next(err);
    }
}

export const updateimg=async(req,res)=>{
    const {categoryId}=req.params;
    const image=req.files;
    const imgs=image.map((item)=>item.filename)
    try {
        const updatedImg=await Category.findByIdAndUpdate(categoryId,{image:imgs},{new:true});
        res.json(updatedImg)
    } catch (error) {
        res.json(error.message)
    }
}

export const getzeroindeximg = async (req, res) => {
    try {
      const categories = await Category.find({}, { _id: 1, image: { $slice: 1 } }); // Only retrieve the first image and category ID
      
      const zerothIndexImages = categories.map(category => ({
        categoryId: category._id,
        image: category.image[0]
      }));
  
      res.json(zerothIndexImages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch zeroth index images from categories' });
    }
  };
  

//not required as it is done in products differently
// // Create a new product within a category
// export const createProductInCategory = async (req, res, next) => {
//     const { name, description, price } = req.body;
//     try {
//         const category = await Category.findById(req.params.id);
//         if (!category) {
//             return next(errorHandler,(400,'Category not found'))
//         }
//         const newProduct = new Product({ name, description, price, category: category._id });
//         const savedProduct = await newProduct.save();
//         category.products.push(savedProduct._id);
//         await category.save();
//         res.status(201).json(savedProduct);
//     } catch (err) {
//         next(err);
//     }
// }

// // Update a product within a category
// export const updateProductInCategory = async (req, res, next) => {
//     try {
//         const product = await Product.findById(req.params.productId);
//         if (!product) {
//             return next(errorHandler,(400,'Product not found'))
//         }
//         product.set(req.body);
//         const updatedProduct = await product.save();
//         res.status(200).json(updatedProduct);
//     } catch (err) {
//         next(err);
//     }
// }

// // Delete a product within a category
// export const deleteProductInCategory = async (req, res, next) => {
//     try {
//         const product = await Product.findById(req.params.productId);
//         if (!product) {
//             return next(errorHandler,(400,'Product not found'))
//         }
//         const category = await Category.findById(product.category);
//         if (category) {
//             category.products = category.products.filter(productId => productId.toString() !== req.params.productId);
//             await category.save();
//         }
//         await product.remove();
//         res.status(200).json({ message: 'Product deleted' });
//     } catch (err) {
//         next(err);
//     }
// }
