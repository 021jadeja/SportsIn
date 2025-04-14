import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" 
		? "http://localhost:5000/api/v1" 
		: "https://backend-6dny.onrender.com/api/v1",
	withCredentials: true,
});
