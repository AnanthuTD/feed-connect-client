import axios, {
	AxiosError,
	AxiosRequestConfig,
	AxiosRequestHeaders,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
	withCredentials: true,
});

export async function fetchCSRF() {
	/* try {
		const response = await axios.get("api/csrf_token/", {
			withCredentials: true,
		});

		const { csrfToken } = response.data;
		return csrfToken;
	} catch (error) {
		console.error("Error during Axios request:", error);
	} */
}

// Add request interceptor to include accessToken in headers
axiosInstance.interceptors.request.use(
	(config) => {
		const accessToken = sessionStorage.getItem("accessToken");
		if (accessToken) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${accessToken}`,
			} as AxiosRequestHeaders;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// refresh token
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error.response?.status === 401 && !originalRequest._retry) {
			// If token expired, refresh it
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const response = await axios.post("api/auth/refresh-token");
					const newAccessToken = response.data.accessToken;

					// Update Authorization header in the original request
					originalRequest.headers = {
						...originalRequest.headers,
						Authorization: `Bearer ${newAccessToken}`,
					};

					// Update access token in the frontend storage
					sessionStorage.setItem("accessToken", newAccessToken);

					// Retry all subscribers with the new token
					refreshSubscribers.forEach((cb) => cb(newAccessToken));
					refreshSubscribers = [];

					return axiosInstance(originalRequest);
				} catch (err) {
					// Handle refresh token failure, e.g., logout
					return Promise.reject(err);
				} finally {
					isRefreshing = false;
				}
			}

			// Queue the request until the token is refreshed
			return new Promise((resolve) => {
				refreshSubscribers.push((token: string) => {
					originalRequest.headers!["Authorization"] = `Bearer ${token}`;
					resolve(axiosInstance(originalRequest));
				});
			});
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
