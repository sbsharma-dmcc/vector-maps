import React from 'react';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { WaypointData } from '@/types/voyage';

interface GenerateVoyageButtonProps {
  waypoints: WaypointData[];
  voyageName: string;
  vesselName: string;
  onGenerate: () => void;
}

const GenerateVoyageButton = ({ 
  waypoints, 
  voyageName, 
  vesselName, 
  onGenerate 
}: GenerateVoyageButtonProps) => {
  const isDisabled = !voyageName.trim() || !vesselName.trim();

  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4">
      <Button 
        onClick={onGenerate}
        className="w-full"
        disabled={isDisabled}
        size="lg"
      >
        <Ship className="w-4 h-4 mr-2" />
        Generate Voyage ({waypoints.length} waypoints)
      </Button>
      {isDisabled && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Please fill in voyage and vessel names
        </div>
      )}
      {!isDisabled && waypoints.length === 0 && (
        <div className="text-xs text-yellow-600 mt-2 text-center">
          No waypoints uploaded. Voyage will be created with basic configuration.
        </div>
      )}
    </div>
  );
};

export default GenerateVoyageButton;