import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firebaseUid: { type: String, unique: true },
    username: {
        type: String,
        maxLength: 50
    },
    password: {
        type: String,
        maxLength: 255
    },
    email: {
        type: String,
        unique: true,
        maxLength: 100
    },
    address: {
        type: String,
        maxLength: 255
    },
    phone: {
        type: String,
        maxLength: 13
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
