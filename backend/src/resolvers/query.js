import { Message } from "../model/messages.model.js";
import { User } from "../model/user.model.js";
import { Op } from "sequelize";

export const query = {
    checkAuth: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        profile_pic: user.profile_pic,
      };
    },
  
    fetchUsers: async(_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      try {
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: user.id }, // Exclude the current user
            },
            attributes: ['id', 'fullname', 'email', 'profile_pic'], // Select only required fields
        });

        return users;
        } catch (error) {
        console.error("Error fetching users:", error.message);
        throw new Error("Failed to fetch users");
    }
      },
  
      getMessages: async (_, { receiverId }, { user }) => {
        try {
          
  
          const messages = await Message.findAll({
            where: {
              [Op.or]: [
                { senderId: user.id, receiverId: receiverId },
                { senderId: receiverId, receiverId: user.id },
              ],
            },
            order: [['created_at', 'ASC']],
            raw: false, // Set to false to use the getter method
            nest: true,
          });
  
          return messages;
        } catch (error) {
          console.error("Error in getMessages resolver:", error.message);
          throw new Error("Internal server error");
        }
      },
    
  };
  