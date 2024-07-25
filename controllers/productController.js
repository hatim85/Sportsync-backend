import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

export const getProducts = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        // console.log("started")
        const products = await Product.find()
            .skip(skip)
            .limit(pageSize);
        // console.log("ended")
        // const exec = await Product.find()
        //     .skip(skip)
        //     .limit(pageSize)
        //     .explain('executionStats');
        // console.log(exec)
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId).populate('category');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const category = product.categoryName;

        res.status(200).json(product);
    } catch (err) {
        next(err); 
    }
};


export const createProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, categoryId } = req.body;

    let image;
    if (req.file) {
        image = req.file.filename;
    } else if (errors) {
        console.log(errors.message)
    }
    else {
        console.log("else block")
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        const newProduct = new Product({ name, description, image, price, categoryId });
        const savedProduct = await newProduct.save();

        category.products.push(savedProduct._id);
        await category.save();

        res.status(201).json(savedProduct);
    } catch (err) {
        next(err);
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Destructure fields to update
        const { name, description, price, categoryId } = req.body;

        // Check if the category ID is provided and different from the current one
        if (categoryId) {
            const newCategory = await Category.findById(categoryId);

            if (!newCategory) {
                return res.status(404).json({ message: 'New category not found' });
            }
        }

        if (categoryId && categoryId !== product.category) {
            // Remove product ID from the old category's products array
            const newCategory = await Category.findById(categoryId);
            const oldCategory = await Category.findById(product.category);

            if (oldCategory) {
                oldCategory.products = oldCategory.products.filter(prodId => prodId.toString() !== productId);
                await oldCategory.save();
            }

            product.category = categoryId;
            newCategory.products.push(productId);
            await newCategory.save();
        }

        // Update other fields if provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;

        if (req.file) {
            product.image.push(req.file.filename)
        }

        // if (image) product.image=image

        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
    } catch (err) {
        next(err);
    }
}


export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const categoryId = product.category;

        // // Remove product ID from the associated category's products array
        // const category = await Category.findById(categoryId);
        // if (category) {
        //     category.products = category.products.filter(productId => productId.toString() !== req.params.productId);
        //     await category.save();
        // }

        const category = await Category.findById(categoryId);
        if (category) {
            category.products = category.products.filter(productId => productId.toString() !== req.params.productId);
            await category.save();
        }

        // Remove the product document
        await Product.deleteOne({ _id: req.params.productId });
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({ categoryId: categoryId }).exec();
        res.json({ success: true, products: products });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const search = async (req, res) => {
    const query = req.params.q;
    try {
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid search query');
        }
        const results = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).populate('categoryId'); // This will populate the category details in the results
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const similarProduct = async (req, res) => {
    try {
        const currentProduct = await Product.findById(req.params.productId);
        const similarProducts = await Product.find({ category: currentProduct.category, _id: { $ne: currentProduct._id } }).limit(7); // Limiting to 4 similar products
        res.json(similarProducts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

export const updateImages = async (req, res) => {
    const { productId } = req.params;
    const images = req.files;

    const imgs = images?.map(item => item.filename)

    try {
        const updatedImage = await Product.findByIdAndUpdate(productId, { image: imgs }, { new: true });
        res.json(updatedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const validate = (method) => {
    switch (method) {
        case 'createProduct': {
            return [
                body('name', 'Name is required').trim().notEmpty(),
                body('description', 'Description is required').trim().notEmpty(),
                body('price', 'Price is required').isNumeric().notEmpty(),
                body('categoryId', 'Category is required').trim().notEmpty()
            ];
        }
        case 'updateProduct': {
            return [
                body('name', 'Name is required').optional().trim().notEmpty(),
                body('description', 'Description is required').optional().trim().notEmpty(),
                body('price', 'Price is required').optional().isNumeric().notEmpty(),
                body('categoryId', 'Category is required').optional().trim().notEmpty()
            ];
        }
    }
}