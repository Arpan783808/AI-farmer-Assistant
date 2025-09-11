import { Moon, Sun } from "lucide-react"

import { Button } from "./ui/button"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

   const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    // <Button variant="outline" size="icon" className="cursor-pointer">
    <Button variant="outline" size="icon" onClick={toggleTheme} className="cursor-pointer">
      <Moon className="h-[1.2rem] w-[1.2rem] transition-all dark:hidden" />
      <Sun className="hidden h-[1.2rem] w-[1.2rem] transition-all dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}