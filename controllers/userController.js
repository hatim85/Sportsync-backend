import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js'
import User from '../models/userModel.js'
import Address from '../models/addressModel.js'

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You are not allowed to update this user'))
    }
    if (req.body.password) {
        if (req.body.password.length < 6) {
            return next(errorHandler(400, 'Password must be atleast 6 charaters'))
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    if (req.body.username) {
        if (req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be less than 20 characters'));
        }
        if (req.body.username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain space'))
        }
        if (req.body.username !== req.body.username.toLowerCase()) {
            return next(errorHandler(400, 'Username must be in lowercase'))
        }
        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username can only contain letters and numbers'))
        }
    }
    if (req.body.phone) {
        if (req.body.phone.length !== 10) {
            return next(errorHandler(400, 'Phone number must be 10 digits'))
        }
        if (!req.body.phone.match(/^[0-9]+$/)) {
            return next(errorHandler(400, 'Phone number can only contain numbers'))
        }
    }
    if (req.body.email) {
        if (!req.body.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            return next(errorHandler(400, 'Invalid email address'))
        }
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password
            }
        }, { new: true });
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    }
    catch (error) {
        next(error);
    }
}

export const deleteUser=async(req,res,next)=>{
    try{
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json('User has been deleted');
    }
    catch(error){
        next(error);
    }
}

export const signout=(req,res,next)=>{
    try {
        res
            .clearCookie('access_token')
            .status(200)
            .json('Signout successfull');
    } catch (error) {
        next(error);
    }
}

export const getUsers=async(req,res,next)=>{
    if(!req.user.userType==='admin'){
        return next(errorHandler(403,'You are not allowed to see all user'))
    }
    try{
        const page = req.query.page || 1;
        const pageSize = 10; 
        const skip = (page - 1) * pageSize;
  
        const users = await User.find()
            .skip(skip)
            .limit(pageSize);
  
        res.status(200).json(users);
    }
    catch(error){
      res.status(500).json({message:error.message})
    }
}

export const getUser=async(req,res,next)=>{
    try {
        const user=await User.findById(req.params.userId);
        if(!user){
            return next(errorHandler(404,'User not found'));
        }
        const {password,...rest}=user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}

export const addAddress=async(req,res)=>{
    try {
        const {userId}=req.params;
        const {  fullName, addressLine1, addressLine2, city, postalCode, phoneNumber, isDefault } = req.body;

        // Create a new address object
        const newAddress = new Address({
            userId,
            fullName,
            addressLine1,
            addressLine2,
            city,
            postalCode,
            phoneNumber,
            isDefault
        });

        // Save the new address to the database
        await newAddress.save();

        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUserAddresses = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find addresses associated with the user ID
        const addresses = await Address.find({ userId });

        // Check if addresses were found
        if (!addresses) {
            return res.status(404).json({ message: 'Addresses not found for the user' });
        }

        // Return the addresses
        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUserAddress=async(req,res)=>{
    const addressId=req.params.addressId;
    // console.log(addressId)

    if(!addressId){
        return res.status(404).json("Address not found")
    }

    try{
        await Address.findByIdAndDelete(addressId);
        res.status(200).json("Address deleted successfully");
    }
    catch(error){
        res.status(500).json(error);
    }
}

