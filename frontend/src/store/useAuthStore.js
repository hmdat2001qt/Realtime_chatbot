import toast from "react-hot-toast";
import { create } from "zustand";
import { ApolloClient, gql } from "@apollo/client";
import { client } from "../lib/apolloClient";
import { io } from "socket.io-client";


const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  toast.error(error?.message || defaultMessage);
};

const GET_USER = gql`
  query {
    checkAuth {
      id
      fullname
      email
      profile_pic
    }
  }
`;

const SIGNUP_USER = gql`
  mutation signup($fullname: String!, $email: String!, $password: String!) {
    signup(fullname: $fullname, email: $email, password: $password) {
      id
      fullname
      email
      profile_pic
      token
    }
  }
`;

const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      fullname
      email
      profile_pic
      token
    }
  }
`;

const LOGOUT_USER = gql`
  mutation {
    logout
  }
`;

const UPDATE_PROFILE = gql`
  mutation updateProfile($profile_pic: String) {
    updateProfile(profile_pic: $profile_pic) {
      id
      fullname
      email
      profile_pic
    }
  }
`;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
 

  checkAuth: async () => {
    try {
      const { data } = await client.query({ query: GET_USER });
      set({ authUser: data.checkAuth });
      const { socket } = get();
      if (!socket?.connected) {
        get().connectSocket();  // Only connect if not already connected
      }
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const { data } = await client.mutate({
        mutation: SIGNUP_USER,
        variables: formData,
      });
      set({ authUser: data.signup });
      toast.success("Signup successful!");
      await get().connectSocket();
    } catch (error) {
      handleError(error, "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoggingIn: true });
    try {
      const { data } = await client.mutate({
        mutation: LOGIN_USER,
        variables: { email, password },
      });
      localStorage.setItem("jwt", data.login.token);
      set({ authUser: data.login });
      toast.success("Login successful!");
      await get().connectSocket();
    } catch (error) {
      handleError(error, "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await client.mutate({ mutation: LOGOUT_USER });
      set({ authUser: null });
      await get().disconnectSocket();
      await client.clearStore();
      toast.success("Logout successful!");
    } catch (error) {
      handleError(error, "Logout failed");
    }
  },

  updateProfile: async (profile_pic) => {
    set({ isUpdatingProfile: true });
    const imageString = profile_pic.profile_pic;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_PROFILE,
        variables: { profile_pic: imageString },
      });
      set({ authUser: data.updateProfile });
      toast.success("Profile updated!");
    } catch (error) {
      handleError(error, "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: async () => {
    const { socket } = get();
    if (socket?.connected) return;
    let authUser = get().authUser;
  
    let retries = 0;
    while (!authUser && retries < 40) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // wait 50ms
      authUser = get().authUser;
      retries++;
    }
  
    if (!authUser) return;
  
    if (socket) {
      socket.disconnect(); // Clean up old socket
      set({ socket: null });
    }
  
    const newSocket = io("http://localhost:5001", {
      withCredentials: true,
      query: {
        userId: authUser.id,
      },
    });
  
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      set({ socket: newSocket });
  
      newSocket.emit("user:online", { userId: authUser.id });
  
      // 🟰 Immediately add current user into onlineUsers
      set((state) => ({
        onlineUsers: [{ ...authUser }],
      }));
    });
  
    set({ socket: socket });

    
  },
  
  

  disconnectSocket: () => {
   if (get().socket?.connected) get().socket.disconnect();
  },
}));
