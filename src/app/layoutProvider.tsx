'use client'
import React from "react";
import { ConfigProvider, theme } from "antd";

const {darkAlgorithm} = theme;

function LayoutProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ConfigProvider theme={{algorithm:darkAlgorithm}}>{children}</ConfigProvider>
  )
}

export default LayoutProvider