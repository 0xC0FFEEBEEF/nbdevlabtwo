import { IconArrowUpRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="relative flex h-(--header-height) shrink-0 items-center gap-2 border-b border-white/10 bg-background/70 backdrop-blur-sm transition-[width,height] ease-linear before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">nbdevlab</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground shadow-sm transition hover:border-white/20 hover:text-foreground sm:flex"
          >
            <a
              href="https://github.com/0xC0FFEEBEEF/nbdevlab"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              View Source
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
