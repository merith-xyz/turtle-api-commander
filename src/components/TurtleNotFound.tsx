
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TurtleNotFoundProps {
  turtleId: number;
}

const TurtleNotFound = ({ turtleId }: TurtleNotFoundProps) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700 clip-edge">
      <h2 className="text-xl font-semibold mb-2">Turtle Not Found</h2>
      <p className="text-gray-400 mb-4">
        Could not find turtle with ID {turtleId}
      </p>
      <Button asChild className="bg-blue-600 hover:bg-blue-500 clip-edge-btn">
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default TurtleNotFound;
