import React, { ReactNode } from "react";
import { Modal } from "antd";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-lg shadow-lg p-4 bg-white sm:max-w-lg w-full"
      title={<h2 className="text-xl font-semibold text-center">{title}</h2>} 
      styles={{body:{
				padding: "1rem",
        textAlign: "center", 
			}
      }}
    >
      <div className="p-4">{children}</div>
    </Modal>
  );
};

export default Popup;
