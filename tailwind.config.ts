import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
	content: [
		// "./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./src/app/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				side_bar_hover: "#121212",
				border_grey: "#363837",
				brightBlue: "#008fec",
				instaBlue: "#008fec",
				_grey: "#121212",
				secondryText: "rgb(168 168 168)",
				primaryText: "rgb(245 245 245)",
				elevated: "rgb(38 38 38)",
				blackBlur: "#000000ad",
				nero: "#202023",
			},
			maxWidth: {
				"1/2": "50%",
			},
		},
	},
	plugins: [
		plugin(function ({ addUtilities }) {
			addUtilities({
				".no-scrollbar::-webkit-scrollbar": {
					display: "none",
				},
				".no-scrollbar": {
					/* "-ms-overflow-style": "none",
              "scrollbar-width": "none", */
					"&::-webkit-scrollbar": {
						display: "none",
					},
				},
				".pointer-events-auto": {
					"pointer-events": "auto",
				},
			});
		}),
	],
};
export default config;
