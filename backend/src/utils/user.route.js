import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken';


export const getCurrentUser = async(req) => {

    const token = req.cookies?.jwt;
    
        if (!token) {
          throw new Error("Unauthorized - No Token Provided");
        }
    
        let decoded;
        try {
          // Verify the token
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.error("Invalid token:", err.message);
          throw new Error("Unauthorized - Invalid Token");
        }
    
        // Fetch the user from the database
        const user = await User.findOne({ where: { id: decoded.userId } });

        if (!user) {
              throw new Error("User not found");
            }
        
           
        return user
}