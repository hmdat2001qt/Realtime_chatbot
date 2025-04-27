import { create } from "zustand"
import { gql } from '@apollo/client';
import toast from "react-hot-toast";
import { client } from "../lib/apolloClient";
import { useAuthStore } from "./useAuthStore";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  toast.error(error?.message || defaultMessage);
};

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      id
      fullname
      email
      profile_pic
    }
  }
`;
const SEND_MESSAGE = gql`
  mutation sendMessage($receiverId: ID!, $text: String, $image: String) {
    sendMessage(receiverId: $receiverId, text: $text, image: $image) {
      id
      text
      image
      createdAt
      senderId
      receiverId
    }
  }
`
const GET_MESSAGES = gql`
   query GetMessages($userId: ID!) {
    getMessages(receiverId: $userId) {
    id
    senderId
    receiverId
    text
    image
    createdAt
  }
}
`;

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,



    getUsers: async () => {
      set({ isUsersLoading: true });
        try {
          const { data } = await client.query({
            query: FETCH_USERS,
          });
          set({ users: data.fetchUsers });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const { data } = await client.query({
            query: GET_MESSAGES,
            variables: { userId },
            fetchPolicy: 'network-only', // Optional: always refetch from server
          });
          console.log("Fetched messages:", data.getMessages);
    
          set({ messages: data.getMessages });
        } catch (error) {
          handleError( "get Message failed");
          
        } finally {
          set({ isMessagesLoading: false });           
        }
      },
      

      sendMessage: async ({ text, image }) => {
        const { selectedUser } = get();
        if (!selectedUser) {
          toast.error("No user selected");
          return;
        }
      
        try {
          console.log("Sending message to:", selectedUser.id, "with data:", { text, image });
      
          const { data } = await client.mutate({
            mutation: SEND_MESSAGE,
            variables: {
              receiverId: selectedUser.id,
              text,
              image,
            },
          });
      
          const newMessage = data.sendMessage;
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        } catch (error) {
          toast.error(error?.message || "Failed to send message");
        }
      },
      

     
      
      subscribeToMessages: () => {
        const waitForReady = setInterval(() => {
          const { selectedUser } = get();
          const socket = useAuthStore.getState().socket;
      
          if (socket && selectedUser) {
            clearInterval(waitForReady);
      
            // Avoid multiple listeners: remove existing first
            socket.off("new:message");
      
            socket.on("new:message", (newMessage) => {
              const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser.id;
              if (!isMessageSentFromSelectedUser) return;
      
              set({
                messages: [...get().messages, newMessage],
              });
            });
          }
        }, 5000); // check every 100ms
      },
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket && socket.off) {
          socket.off("new:message");
        } else {
          console.warn("Socket not connected or unavailable in unsubscribeFromMessages");
        }
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),
}))