import React from "react";
import { Popover } from "@headlessui/react";
import OptionsIcon from "@/app/components/icons/OptionIcon";

function OptionsPopup({
	children,
	height = "",
}: {
	children: React.ReactNode;
	height: String;
}) {
	return (
		<>
			<Popover className="relative flex">
				<div
					className={["mx-3 mt-0 flex items-center"].join(" ")}
					style={{ height: `${height}` }}>
					<Popover.Button className="h-fit outline-none">
						<OptionsIcon />
					</Popover.Button>
				</div>

				<Popover.Panel className="absolute right-5 z-10">
					<div className="rounded-full p-2 text-xs font-bold backdrop-blur-sm">
						{children}
					</div>
				</Popover.Panel>
			</Popover>
		</>
	);
}

export default OptionsPopup;
