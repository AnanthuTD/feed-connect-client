/** @type {import('next').NextConfig} */

const nextConfig = {
	images:{
		remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storehub.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
	}
};

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
