import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { Settings as SettingsIcon, Shield, MapPin, Clock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState(settings);

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>Access denied</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast.success('Settings updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-gray-500">Configure system-wide preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
            <CardDescription>Control user registration and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Self Registration</Label>
                <p className="text-sm text-gray-500">Let users create their own accounts</p>
              </div>
              <Switch
                checked={formData.allowSelfRegistration}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowSelfRegistration: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Face Verification</Label>
                <p className="text-sm text-gray-500">Mandate biometric authentication for clock in/out</p>
              </div>
              <Switch
                checked={formData.requireFaceVerification}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requireFaceVerification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Geofencing
            </CardTitle>
            <CardDescription>Configure location tracking settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Geofencing</Label>
                <p className="text-sm text-gray-500">Mark attendance as in-office or remote based on location</p>
              </div>
              <Switch
                checked={formData.enableGeofencing}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableGeofencing: checked })
                }
              />
            </div>

            {formData.enableGeofencing && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="text-sm">Office Locations</p>
                {formData.officeLocations.map((location, index) => (
                  <div key={location.id} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <Input
                        placeholder="Name"
                        value={location.name}
                        onChange={(e) => {
                          const newLocations = [...formData.officeLocations];
                          newLocations[index].name = e.target.value;
                          setFormData({ ...formData, officeLocations: newLocations });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Latitude"
                        value={location.latitude}
                        onChange={(e) => {
                          const newLocations = [...formData.officeLocations];
                          newLocations[index].latitude = parseFloat(e.target.value);
                          setFormData({ ...formData, officeLocations: newLocations });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Longitude"
                        value={location.longitude}
                        onChange={(e) => {
                          const newLocations = [...formData.officeLocations];
                          newLocations[index].longitude = parseFloat(e.target.value);
                          setFormData({ ...formData, officeLocations: newLocations });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Radius (m)"
                        value={location.radius}
                        onChange={(e) => {
                          const newLocations = [...formData.officeLocations];
                          newLocations[index].radius = parseFloat(e.target.value);
                          setFormData({ ...formData, officeLocations: newLocations });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const newLocations = formData.officeLocations.filter((_, i) => i !== index);
                        setFormData({ ...formData, officeLocations: newLocations });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      officeLocations: [
                        ...formData.officeLocations,
                        {
                          id: `office-${Date.now()}`,
                          name: '',
                          latitude: 0,
                          longitude: 0,
                          radius: 100,
                        },
                      ],
                    });
                  }}
                >
                  Add Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours & Overtime
            </CardTitle>
            <CardDescription>Define standard hours and overtime calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Working Hours Per Day</Label>
                <Input
                  type="number"
                  value={formData.workingHoursPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, workingHoursPerDay: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Working Days Per Week</Label>
                <Input
                  type="number"
                  value={formData.workingDaysPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, workingDaysPerWeek: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Overtime Rules</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Daily Threshold (hours)</Label>
                  <Input
                    type="number"
                    value={formData.overtimeRules.dailyThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overtimeRules: {
                          ...formData.overtimeRules,
                          dailyThreshold: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Weekly Threshold (hours)</Label>
                  <Input
                    type="number"
                    value={formData.overtimeRules.weeklyThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overtimeRules: {
                          ...formData.overtimeRules,
                          weeklyThreshold: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.overtimeRules.multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overtimeRules: {
                          ...formData.overtimeRules,
                          multiplier: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </form>
    </div>
  );
};
