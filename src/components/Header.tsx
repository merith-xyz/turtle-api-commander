
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const Header = ({ onRefresh, isLoading }: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
          <span className="text-primary text-2xl font-bold">T</span>
        </div>
        <h1 className="text-xl font-bold">Turtle Commander</h1>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        <span>Refresh</span>
      </Button>
    </header>
  );
};

export default Header;
