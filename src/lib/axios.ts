import axios from "axios";

const axiosInstance = axios.create({
	withCredentials: true,
});

export async function fetchCSRF() {
	try {
		const response = await axios.get("api/csrf_token/", {
			withCredentials: true,
		});

		const { csrfToken } = response.data;
		return csrfToken;
	} catch (error) {
		console.error("Error during Axios request:", error);
	}
}

axiosInstance.interceptors.request.use(
	async function (config) {
		const csrfToken = await fetchCSRF();
		config.headers["X-CSRFToken"] = csrfToken;
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

export default axiosInstance;
