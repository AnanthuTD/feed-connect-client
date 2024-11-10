"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles.module.css";
import validateEmail from "@/../public/javascripts/validate_email";
import validatePhone from "@/../public/javascripts/validate_phone";
import validatePassword from "@/../public/javascripts/validate_password";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

interface IsValidState {
	phoneOrEmail?: boolean;
	password?: boolean;
	username?: boolean;
}

interface ErrorState {
	phoneOrEmail?: string;
	password?: string;
	username?: string;
	phone?: string;
}

export default function Signup() {
	const [formData, setFormData] = useState({});
	const [isValid, setIsValid] = useState<IsValidState>({});
	const [errors, setErrors] = useState<ErrorState>({});
	const [showPassword, setShowPassword] = useState<boolean>(false);

	// const { setUser } = useUserContext();

	const router = useRouter();

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	async function validate_email_or_mobile(data: string) {
		setIsValid((isValid) => ({ ...isValid, phoneOrEmail: true }));
		if (validateEmail(data)) {
			setFormData({
				...formData,
				phoneOrEmail: data,
			});
		} else if (validatePhone(data)) {
			setFormData({
				...formData,
				phoneOrEmail: data,
			});
		} else {
			setIsValid((isValid) => ({ ...isValid, phoneOrEmail: false }));
		}
	}

	async function validate_password(password: string) {
		var result = await validatePassword(password);
		if (result) {
			setIsValid((isValid) => ({ ...isValid, password: result }));
		}
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			const response = await axios.post("api/user/signup/", formData, {
				headers,
				withCredentials: true, // Include credentials in the request
			});

			const signupData = response.data;

			if (signupData.status) {
				router.replace("/");
			} else if (signupData.errors) {
				setErrors(signupData.errors);
				// Handle error messages or other actions for failed signup
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here or display an error message to the user
		}
	};

	useEffect(() => {
		if (Object.keys(errors).length !== 0) {
			console.error("errors: ", errors);

			if (errors.hasOwnProperty("phoneOrEmail")) {
				setIsValid((isValid) => ({
					...isValid,
					phoneOrEmail: false,
				}));
			}
			if (errors.hasOwnProperty("password")) {
				setIsValid((isValid) => ({ ...isValid, password: false }));
			}
			if (errors.hasOwnProperty("username")) {
				setIsValid((isValid) => ({ ...isValid, username: false }));
			}
		}
	}, [errors]);

	return (
		<>
			<div className="mb-3 flex w-80 flex-col items-center border border-gray-300 bg-white py-8">
				<form className="mt-8 flex w-64 flex-col" onSubmit={handleSubmit}>
					<div className="relative mb-2 flex items-center">
						<div className="absolute inset-y-0 right-0 flex items-center pr-2">
							{!isValid.hasOwnProperty(
								"phoneOrEmail"
							) ? null : isValid.phoneOrEmail ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="grey"
									className="h-6 w-6">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="red"
									className="h-6 w-6">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							)}
						</div>
						<input
							autoFocus
							name="phoneOrEmail"
							className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-2 text-xs text-black focus:border-gray-400 focus:outline-none active:outline-none"
							id="phoneOrEmail"
							placeholder="mobile number or email"
							type="text"
							onChange={(e) => validate_email_or_mobile(e.target.value)}
						/>
					</div>
					<input
						autoFocus
						name="fullName"
						className="mb-2 w-full rounded border border-gray-300 bg-gray-100 px-2 py-2 text-xs text-black focus:border-gray-400 focus:outline-none active:outline-none"
						id="name"
						placeholder="full name"
						type="text"
						onChange={(e) =>
							setFormData({
								...formData,
								fullName: e.target.value,
							})
						}
					/>
					<input
						autoFocus
						name="username"
						className="mb-2 w-full rounded border border-gray-300 bg-gray-100 px-2 py-2 text-xs text-black focus:border-gray-400 focus:outline-none active:outline-none"
						id="username"
						placeholder="username"
						type="text"
						onChange={(e) =>
							setFormData({
								...formData,
								username: e.target.value,
							})
						}
					/>
					{/* password */}
					<div className="relative mb-2 flex items-center">
						<div className="absolute inset-y-0 right-0 flex items-center pr-2">
							{!isValid.hasOwnProperty(
								"phoneOrEmail"
							) ? null : isValid.phoneOrEmail ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="grey"
									className="h-6 w-6">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="red"
									className="h-6 w-6">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							)}
						</div>
						<input
							autoFocus
							name="password"
							className="w-full rounded border border-gray-300 bg-gray-100 px-2 py-2 text-xs text-black focus:border-gray-400 focus:outline-none active:outline-none"
							id="password"
							placeholder="Password"
							type={showPassword ? "text" : "password"}
							onChange={(e) =>
								setFormData({
									...formData,
									password: e.target.value,
								})
							}
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-2">
							<svg
								fill="none"
								onClick={togglePasswordVisibility}
								className={[
									"h-6 text-gray-700",
									showPassword ? "hidden" : "block",
								].join(" ")}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 576 512">
								<path
									fill="currentColor"
									d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
							</svg>

							<svg
								fill="none"
								onClick={togglePasswordVisibility}
								className={[
									"h-6 text-gray-700",
									showPassword ? "block" : "hidden",
								].join(" ")}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512">
								<path
									fill="currentColor"
									d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path>
							</svg>
						</div>
					</div>
					<button
						type="submit"
						className=" cursor-pointer rounded bg-blue-300 py-1 text-center text-sm font-medium text-white">
						Signup
					</button>
				</form>
				<div className="mt-4 flex w-64 justify-evenly space-x-2">
					<span className="t-2 relative top-2 h-px flex-grow bg-gray-300"></span>
					<span className="flex-none text-xs font-semibold uppercase text-gray-400">
						or
					</span>
					<span className="t-2 relative top-2 h-px flex-grow bg-gray-300"></span>
				</div>
				<button className="mt-4 flex">
					<div
						className={["bg-no-repeat", styles.facebook_logo, "mr-1"].join(
							" "
						)}></div>
					<span className="cursor-pointer text-xs font-semibold text-blue-900">
						Log in with Facebook
					</span>
				</button>
				<a className="-mb-4 mt-4 cursor-pointer cursor-pointer text-xs text-blue-900">
					Forgot password?
				</a>
			</div>
			<div className="w-80 border border-gray-300 bg-white py-4 text-center">
				<span className="text-sm text-black">Already have an account?</span>
				<Link href={"/login"}>
					<div className="cursor-pointer text-sm font-semibold text-blue-500">
						Login
					</div>
				</Link>
			</div>
			<div className="mt-3 text-center">
				<span className="cursor-pointer text-xs">Get the app</span>
				<div className="mt-3 flex space-x-2">
					<div
						className={["bg-no-repeat", styles.apple_store_logo].join(
							" "
						)}></div>
					<div
						className={["bg-no-repeat", styles.google_store_logo].join(
							" "
						)}></div>
				</div>
			</div>
		</>
	);
}
