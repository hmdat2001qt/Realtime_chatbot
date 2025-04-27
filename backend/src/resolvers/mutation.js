import { generateToken } from '../utils/ultis.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../utils/cloudinary.js'
import {User} from '../model/user.model.js'
import {Message} from '../model/messages.model.js'
import { getIO } from '../utils/socket.js';

export const mutation = {
  signup: async (_, { fullname, email, password }, {res}) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      profile_pic: '/default.png',
    });
    
      // generate jwt token here
    const token = generateToken(user.id, res);
    res.cookie('jwt', token, { httpOnly: true });

    const userData = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      profile_pic: user.profile_pic,
      token,
    };


    
    return userData


    
  },

  login: async (_, { email, password } , {res, pubsub}) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Incorrect password");

    const token = generateToken(user.id, res);
    
    
    const userData = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      profile_pic: user.profile_pic,
      token,
    };

    
    
    return userData

  },

  logout: async (_, __, { res }) => {
    res.cookie("jwt", "", { maxAge: 0 });
    return true;
  },

  updateProfile: async (_, { profile_pic }, { user }) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const updateData = {}; // Initialize updateData object
      if (profile_pic) {      
        const uploadResponse = await cloudinary.uploader.upload(profile_pic);       
        // Assign secure_url or fallback to url
        updateData.profile_pic = uploadResponse.secure_url; // Use correct field name
        if (!updateData.profile_pic) {
          throw new Error("Cloudinary upload failed. No secure_url returned.");
        }       
      }   
      // Update the user in the database
      const [rowsUpdated] = await User.update(updateData, { where: { id: user.id } });
      if (rowsUpdated === 0) {
        throw new Error("No rows were updated. User ID might be incorrect.");
      }
     

      // Fetch the updated user
      const updatedUser = await User.findByPk(user.id);
      console.log("Updated user from database:", updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Profile update failed");
    }
  },

  sendMessage: async (_, { receiverId, text, image }, { user, sequelize }) => {
    if (!user) throw new Error("Not authenticated");

    const message = await Message.create({
      senderId: user.id,
      receiverId,
      text,
      image,
    });
    
    
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullname'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullname'] },
      ],
      
    });

    const io = getIO();
    io.to(`user:${receiverId}`).emit('message:new', fullMessage);
    return fullMessage;
  },
  
  
};
