import React, { useEffect } from "react";
import EmptyLayout from "../EmptyLayout";
import { persistor } from "../../store";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    persistor.purge();
  }, []);

  return <EmptyLayout hasMaxWidth={false}>{children}</EmptyLayout>;
}
