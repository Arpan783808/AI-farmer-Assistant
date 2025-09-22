import { ModeToggle } from "./mode-toggle"
export default function Navbar() {
  return (
    <nav className="p-4 md:p-6 border-b border-border flex items-center justify-between w-full max-h-12">
      <div className="flex items-center gap-3">
        <img
          src="/logo4.svg"
          alt="Phoenix Logo"
          width={36}
          height={36}
          className="w-12 h-12 dark:invert text-white"
        />
        <h1 className="font-bold font-mono text-xl md:text-2xl text-foreground">
          phoenix
        </h1>
      </div>

      <ModeToggle />
    </nav>
  )
}
