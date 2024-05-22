import users from '../models/userModel.js'
export const verifyAdmin=(req,res,next)=>{
    if(req.user && req.user.userType==='admin'){
        next();
    }
    else{
        console.log('unauthorized',req.users)
        return res.status(403).json({message:'Unauthorized: Only Admins can perform this action'});
    }
}