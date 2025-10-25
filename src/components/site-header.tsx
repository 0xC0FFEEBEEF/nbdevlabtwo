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
        <div className="hidden items-center gap-2 pl-3 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground md:flex">
          <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </span>
          <span>
            LIVE ON <span className="text-foreground">CLOUDFLARE PAGES</span>
          </span>
        </div>
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
          <Button
            asChild
            size="sm"
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-3 text-xs font-semibold text-black shadow-[0_10px_25px_-15px_rgba(255,145,0,0.8)] transition hover:shadow-[0_15px_35px_-15px_rgba(255,145,0,0.9)] md:inline-flex"
          >
            <a href="mailto:hello@nbdevlab.com">
              Say hello
              <IconArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
