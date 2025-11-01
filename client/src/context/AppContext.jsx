import axios from "axios";
import { useContext, useEffect } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import {useUser, useAuth} from "@clerk/clerk-react";
import { useState } from "react";
import { toast} from 'react-hot-toast'
 import { useCallback } from "react";


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) =>{
    
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const {user} = useUser();
    const { getToken} = useAuth();

    const [isOwner, setIsOwner] = useState(false)
    const [showHotelReg, setShowHotelReg] = useState(false)
    const [searchedCities, setSearchedCities] = useState([])



    // eslint-disable-next-line no-unused-vars
   

const fetchUser = useCallback(async () => {
  try {
    const token = await getToken();
    const { data } = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      setIsOwner(data.role === "hotelOwner");
      setSearchedCities(data.recentSearchedCities);
    } else {
      setTimeout(fetchUser, 5000);
    }
  } catch (error) {
    toast.error(error.message);
  }
}, [getToken]);


   useEffect(() => {
  if (user) fetchUser();
}, [user, fetchUser]);

    const value = {
       currency, navigate, user, getToken, isOwner, setIsOwner, axios,
       showHotelReg, setShowHotelReg, searchedCities, setSearchedCities
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = ()=> useContext(AppContext);