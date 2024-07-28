import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js'
import User from '../models/userModel.js'
import Address from '../models/addressModel.js'
import admin from 'firebase-admin'

export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const user = await User.findById(userId);
        console.log(user.firebaseUid)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.firebaseUid) {
            try {
                await admin.auth().deleteUser(user.firebaseUid);
                console.log(`Firebase user with UID ${user.firebaseUid} deleted successfully.`);
            } catch (firebaseError) {
                console.error('Error deleting user from Firebase:', firebaseError);
                return res.status(500).json({ success: false, message: 'Error deleting user from Firebase' });
            }
        }

        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: 'User has been deleted' });
    } catch (error) {
        next(error);
    }
};

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

export const getUsers = async (req, res, next) => {
    // if (req.userType !== 'admin') {
    //   return next(errorHandler(403, 'You are not allowed to see all users'));
    // }
    try {
      const page = req.query.page || 1;
      const pageSize = 10;
      const skip = (page - 1) * pageSize;
  
      let users = await User.find().skip(skip).limit(pageSize);
  
      // Ensure users is always an array
    //   if (typeof(users)==Object) {
    //     users = [users];
    // }
    console.log(typeof(users))
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


export const addAddress=async(req,res)=>{
    try {
        const {userId}=req.params;
        const {  fullName,country, addressLine1, addressLine2, city, postalCode, phoneNumber, isDefault } = req.body;

        const newAddress = new Address({
            userId,
            fullName,
            addressLine1,
            addressLine2,
            city,
            country,
            postalCode,
            phoneNumber,
            isDefault
        });

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
        const addresses = await Address.find({ userId });

        if (!addresses) {
            return res.status(404).json({ message: 'Addresses not found for the user' });
        }

        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUserAddress=async(req,res)=>{
    const addressId=req.params.addressId;

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

