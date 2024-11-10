/** @type {import('next').NextConfig} */

const nextConfig = {};

const apiUrl = process.env.API_URL;
console.log("apiUrl: ", apiUrl)

module.exports = {
	...nextConfig,
	typescript: {
		ignoreBuildErrors: true,
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${apiUrl}/:path*`,
			},
		];
	},
};
