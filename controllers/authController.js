import User from '../models/userModel.js'
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'

export const signup = async (req, res, next) => {
    const { username, email, password, phone } = req.body;
    console.log("Username: ", username, " email: ", email);
    // if (!username || !email || !password || !phone || username === '' || email === '' || password === '' || phone === '') {
    //     next(errorHandler(400, 'All fields are required'));
    // }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        phone
    });
    try {

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Signup successful',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        });
    } catch (error) {
        next(error);
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, 'User not found'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, 'Invalid password'));
        }

        const token = jwt.sign(
            { id: validUser._id, userType: validUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const { password: pass, ...rest } = validUser._doc;

        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true
            })
            .json(rest);
    }
    catch (error) {
        next(error);
    }
};

export const firebaseSignin = async (req, res) => {
    const { accessToken, phone } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(accessToken);
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;
        const username = decodedToken.name;

        console.log("decoded token: ", decodedToken);
        console.log("Firebase uid: ", firebaseUid, " email: ", email, " username: ", username, " phone: ", phone);

        let user = await User.findOne({ firebaseUid });

        if (!user) {
            user = new User({
                firebaseUid,
                username,
                email,
                phone
            });

            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true
            })
            .json(user);
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
export const phoneSignin = async (req, res) => {
    const { accessToken, phone, username, email } = req.body;
    console.log("Accesstoken and its type: ", accessToken, ":", typeof (accessToken))
    try {
        const decodedToken = await admin.auth().verifyIdToken(accessToken);
        const firebaseUid = decodedToken.uid;

        console.log("decoded token: ", decodedToken);

        let user = await User.findOne({ firebaseUid });

        if (!user) {
            user = new User({
                firebaseUid,
                phone,
                username,
                email
            });

            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true
            })
            .json(user);
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const checkUser = async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (user) {
            res.status(200).json({ isNewUser: false, user });
        } else {
            res.status(200).json({ isNewUser: true });
        }
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const addPhone = async (req, res) => {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
        return res.status(400).json({ message: 'User ID and phone number are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userWithSamePhone = await User.findOne({ phone });
        if (userWithSamePhone) {
            return res.status(400).json({ message: 'Phone number already exists.' });
        }

        user.phone = phone;
        await user.save();

        res.status(200).json({ message: 'Phone number updated successfully', user });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
