import * as React from "react"
import {
  IconBrandGithub,
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconMail,
  IconNotebook,
  IconReport,
  IconSettings,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Nathan Bullock",
    email: "hello@nbdevlab.com",
    avatar: "/favicon.svg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Projects",
      url: "/projects/",
      icon: IconFolder,
    },
    {
      title: "Writing",
      url: "/blog/",
      icon: IconFileDescription,
    },
    {
      title: "Status Board",
      url: "/status/",
      icon: IconReport,
    },
    {
      title: "About",
      url: "/about/",
      icon: IconListDetails,
    },
  ],
  navSecondary: [
    {
      title: "Content Studio",
      url: "/admin/",
      icon: IconSettings,
    },
    {
      title: "Status Feeds",
      url: "/status/",
      icon: IconReport,
    },
    {
      title: "Contact",
      url: "mailto:hello@nbdevlab.com",
      icon: IconMail,
    },
    {
      title: "GitHub",
      url: "https://github.com/0xC0FFEEBEEF/nbdevlab",
      icon: IconBrandGithub,
    },
    {
      title: "Colophon",
      url: "/about/#colophon",
      icon: IconNotebook,
    },
  ],
  documents: [
    {
      name: "Project Archive",
      url: "/projects/",
      description: "Build retrospectives and ongoing worklogs.",
      icon: IconFolder,
    },
    {
      name: "Status Log",
      url: "/status/",
      description: "Uptime snapshots and telemetry dashboards.",
      icon: IconReport,
    },
    {
      name: "Writing Handbook",
      url: "/about/",
      description: "Editorial guidelines and style notes for new posts.",
      icon: IconFileDescription,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">nbdevlab</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
