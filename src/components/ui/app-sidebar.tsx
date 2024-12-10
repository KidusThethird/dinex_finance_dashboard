"use client"; // Required for `usePathname`

import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, Home, Inbox, ChartColumnBig, Settings, CircleUser , UtensilsCrossed , FileClock , AlignCenter} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
 
 
  {
    title: "Pending Orders",
    url: "/pending_orders",
    icon: AlignCenter,
  },
  {
    title: "History",
    url: "/history",
    icon: FileClock,
  },
  {
    title: "Fainance Table",
    url: "/finance_table",
    icon: ChartColumnBig,
  },
  {
    title: "Statstics",
    url: "/finance_statstics",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname(); // Get the current path

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {/* Logo Section */}
          <div className="flex items-center m-4">
            <Image
              src="/logo/Untitled.jpg" // Path relative to the public directory
              alt="Company Logo"
              width={70} // Adjust width
              height={90} // Adjust height
              className="bg-gray-400 rounded" // Optional styling
            />
          </div>

          <SidebarGroupLabel>DineX Finance Dashboard</SidebarGroupLabel>

          {/* Sidebar Menu */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Check if the current route starts with the menu item's URL
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                          isActive
                            ? "bg-primaryColor text-white" // Active styles
                            : "text-gray-700 hover:bg-gray-100" // Default styles
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
