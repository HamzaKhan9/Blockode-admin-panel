import { ModalProps, Modal } from "antd";
import React from "react";

export type CustomModalProps = ModalProps & {
  children: React.ReactNode;
};

function CustomModal({ children, ...props }: ModalProps) {
  return (
    <Modal centered {...props}>
      {children}
    </Modal>
  );
}

export default CustomModal;
