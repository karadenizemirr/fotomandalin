"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/organisms/navbar/navbar";

export default function ConditionalNavbar() {
  const pathname: any = usePathname();

  // Auth sayfalarında navbar'ı gösterme
  const hideNavbarPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
