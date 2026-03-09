import { ThemeProvider } from '../ThemeProvider';
import { Button } from "@/components/ui/button";
import { useTheme } from '../ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 space-y-4">
      <h3 className="text-lg font-semibold">Theme Provider Example</h3>
      <p className="text-muted-foreground">Current theme: {theme}</p>
      <div className="flex gap-2">
        <Button 
          variant={theme === "light" ? "default" : "outline"}
          onClick={() => setTheme("light")}
        >
          Light
        </Button>
        <Button 
          variant={theme === "dark" ? "default" : "outline"}
          onClick={() => setTheme("dark")}
        >
          Dark
        </Button>
        <Button 
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => setTheme("system")}
        >
          System
        </Button>
      </div>
    </div>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}