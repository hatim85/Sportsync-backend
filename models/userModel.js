import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        maxLength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxLength: 100
    },
    address: {
        type: String,
        maxLength: 255
    },
    phone: {
        type: String,
        required: true,
        maxLength: 10
    },
    userType: {
        type: String,
        enum: ['customer', 'admin'],
        required: true,
        default: 'customer'
    }
},{timestamps:true});

const User= mongoose.model('User', userSchema);
export default User;
