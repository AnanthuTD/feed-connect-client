import React from "react";

function saved() {
	const Collection = Array(4)
		.fill(null)
		.map((_, index) => {
			return (
				<div className="aspect-square cursor-pointer" key={index}>
					<div className="h-full w-full rounded bg-white">1</div>
				</div>
			);
		});
	return (
		<>
			<div className="aspect-square">
				<div className="grid h-full w-full cursor-pointer grid-cols-2 rounded bg-white">
					<div>1</div>
					<div>2</div>
					<div>3</div>
					<div>4</div>
				</div>
			</div>
			{Collection}
		</>
	);
}

export default saved;
