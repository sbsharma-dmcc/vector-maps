import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Unlock, Trash2, Edit2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { WaypointData } from '@/types/voyage';

interface WaypointsBottomPanelProps {
  waypoints: WaypointData[];
  onWaypointClick: (waypoint: WaypointData) => void;
  onToggleLock: (waypointId: string) => void;
  onDeleteWaypoint: (waypointId: string) => void;
  onUpdateWaypoint: (waypointId: string, updates: Partial<WaypointData>) => void;
}

const WaypointsBottomPanel = ({
  waypoints,
  onWaypointClick,
  onToggleLock,
  onDeleteWaypoint,
  onUpdateWaypoint
}: WaypointsBottomPanelProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<WaypointData>>({});

  const handleEdit = (waypoint: WaypointData) => {
    setEditingId(waypoint.id);
    setEditValues({
      name: waypoint.name,
      lat: waypoint.lat,
      lon: waypoint.lon,
      eta: waypoint.eta
    });
  };

  const handleSave = (waypointId: string) => {
    onUpdateWaypoint(waypointId, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleInputChange = (field: keyof WaypointData, value: string | number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  if (waypoints.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-background border-t border-border transition-all duration-300 ${
      isMinimized ? 'h-12' : 'h-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="font-medium">Waypoints ({waypoints.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-8 w-8 p-0"
        >
          {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waypoints.map((waypoint) => (
                <TableRow 
                  key={waypoint.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => editingId !== waypoint.id && onWaypointClick(waypoint)}
                >
                  <TableCell>
                    <div className={`w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs font-bold text-white ${
                      waypoint.isLocked ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {waypoint.waypointNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === waypoint.id ? (
                      <Input
                        value={editValues.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      waypoint.name || `Waypoint ${waypoint.waypointNumber}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === waypoint.id ? (
                      <Input
                        type="number"
                        step="0.000001"
                        value={editValues.lat || ''}
                        onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      waypoint.lat.toFixed(6)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === waypoint.id ? (
                      <Input
                        type="number"
                        step="0.000001"
                        value={editValues.lon || ''}
                        onChange={(e) => handleInputChange('lon', parseFloat(e.target.value))}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      waypoint.lon.toFixed(6)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === waypoint.id ? (
                      <Input
                        value={editValues.eta || ''}
                        onChange={(e) => handleInputChange('eta', e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      waypoint.eta || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={waypoint.isLocked ? "destructive" : "secondary"}>
                      {waypoint.isLocked ? 'Locked' : 'Unlocked'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {editingId === waypoint.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSave(waypoint.id)}
                            className="h-8 w-8 p-0 text-green-600"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0 text-gray-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(waypoint)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleLock(waypoint.id)}
                            className="h-8 w-8 p-0"
                          >
                            {waypoint.isLocked ? (
                              <Lock className="h-3 w-3 text-orange-500" />
                            ) : (
                              <Unlock className="h-3 w-3 text-blue-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteWaypoint(waypoint.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WaypointsBottomPanel;