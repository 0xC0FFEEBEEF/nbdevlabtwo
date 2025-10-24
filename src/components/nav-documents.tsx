import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
    description: string
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Reference</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className="items-start gap-3 rounded-xl py-2 data-[state=open]:bg-sidebar-accent/70"
            >
              <a href={item.url}>
                <item.icon className="mt-0.5 size-4" />
                <span className="flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">
                    {item.name}
                  </span>
                  <span className="text-muted-foreground text-xs leading-snug">
                    {item.description}
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
