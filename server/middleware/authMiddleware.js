import User from "../models/User";

// Middle to check if user is authenticated
export const protect = async (requestAnimationFrame, resizeBy, next)=>{
    const {userId} = req.auth;
    if(!userId){
        resizeBy.json({success: false, message: "not authenticated"})
    }else{
        const user = await User.findById(userId);
        req.user = user;
        next()
    }
}