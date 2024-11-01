"use client";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, List, Button, Row } from "antd";
import axios from "@/lib/axios";
import debounce from "lodash/debounce";
import Link from "next/link";

const { Item } = List;

interface InputRef {
	input: HTMLInputElement | null;
}

const SearchAccounts: React.FC<{
	onCancel: () => void;
}> = ({ onCancel }) => {
	const [searchValue, setSearchValue] = useState<string>("");
	const [searchResults, setSearchResults] = useState<any[]>([]);

	const inputRef = useRef<InputRef>({ input: null });

	useEffect(() => {
		if (inputRef.current.input) {
			inputRef.current.input.focus();
		}
	}, []);

	const debouncedSearch = debounce(async (value: string) => {
		try {
			const response = await axios.get(`api/accounts/search/?q=${value}`);
			setSearchResults(response.data.users);
		} catch (error) {
			console.error("Error searching:", error);
		}
	}, 300);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchValue(value);
		debouncedSearch(value);
	};

	return (
		<>
			<Modal
				title="New message"
				onCancel={onCancel}
				open={true}
				closable={true}
				okText="Chat"
				footer={
					<Row justify={"center"}>
						<Button
							type="primary"
							style={{ width: "90%" }}
							onClick={onCancel}
						>
							Chat
						</Button>
					</Row>
				}
			>
				<Input
					placeholder="Search"
					prefix="To: "
					onChange={handleSearchChange}
					value={searchValue}
					ref={(el) => {
						if (el) {
							inputRef.current.input = el.input;
						}
					}}
				/>
				<List
					dataSource={searchResults}
					renderItem={(item: any) => (
						<Link href={`/inbox/?id_user=${item.id_user}`}>
							<Item>
								<Item.Meta
									title={item.username}
									description={item.fullname}
								/>
							</Item>
						</Link>
					)}
				/>
			</Modal>
		</>
	);
};

export default SearchAccounts;
