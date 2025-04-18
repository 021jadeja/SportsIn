import axios from "axios";

const axiosInstance = axios.create({
	baseURL:
		import.meta.env.MODE === "development"
			? "http://localhost:5000/api/v1"
			: "https://backend-6dny.onrender.com/api/v1",
});

// Add a request interceptor to set the token
axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export { axiosInstance };
