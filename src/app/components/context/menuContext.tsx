"use client";

import React, { createContext, useContext, useState } from "react";
import { MenuContextInterface, MenuState } from "../../../utils/Interfaces";

const DefaultMenu: MenuState = {
	home: true,
	profile: false,
	create: false,
	search: false,
	explore: false,
	messages: false,
	notifications: false,
	reels: false,
};

const MenuContext = createContext<MenuContextInterface>({
	menu: DefaultMenu,
	HandleSetMenu: (key: keyof MenuState, value = true) => {},
});

export function useMenuContext(): MenuContextInterface {
	return useContext(MenuContext);
}

export function MenuContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [menu, setMenu] = useState<MenuState>(DefaultMenu);

	function HandleSetMenu(key: keyof MenuState, value = true) {
		if (key === "create") {
			setMenu({ ...menu, create: value });
			return;
		}

		let newMenu: MenuState = {
			home: false,
			profile: false,
			create: false,
			search: false,
			explore: false,
			messages: false,
			notifications: false,
			reels: false,
		};

		newMenu[key] = value;
		setMenu(newMenu);
	}

	return (
		<MenuContext.Provider value={{ menu, HandleSetMenu }}>
			{children}
		</MenuContext.Provider>
	);
}
