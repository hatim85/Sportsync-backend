import mongoose from "mongoose";
import Category from "./categoryModel.js";
import User from "./userModel.js";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Price cannot be negative'
        }
    },
    description: {
        type: String,
        required: true,
        maxLength: 1000
    },
    image: {
        type: [String]
        // validate: [arrayLimit, '{PATH} exceeds the limit of 3']
        // required: true
    },
    stock: {
        type: Number,
        // required:true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',              //pending to write required true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, { timestamps: true })

function arrayLimit(val) {
    return val.length <= 3;
}

const Product = mongoose.model('Product', productSchema)
export default Product;