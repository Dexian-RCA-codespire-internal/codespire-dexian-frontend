import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './Button';
import { IoSettingsOutline } from 'react-icons/io5';
import {integrationService} from "../../api"


const IntegrationSettingsModal = ({ isOpen, onClose, integration, setIntegrations }) => {
  // The real state (persisted after Save)
  const [initialSync, setInitialSync] = React.useState(false);
  // The pending state (UI toggle, only allows enabling)
  const [pendingInitialSync, setPendingInitialSync] = React.useState(false);
  const [syncDuration, setSyncDuration] = React.useState('');
  const [syncRecords, setSyncRecords] = React.useState('');
  const [pollingDuration, setPollingDuration] = React.useState('');

  // When modal opens, sync pending state with real state
  React.useEffect(() => {
    if (isOpen) {
      setInitialSync(integration.isInitialSyncCompleted);
      setPendingInitialSync(integration.isInitialSyncCompleted);
      setSyncDuration(integration.bulkFetchBatchDuration);
      setSyncRecords(integration.bulkBatchSize);
      setPollingDuration(integration.pollingDuration);
    }
  }, [isOpen, initialSync]);

  const handleInitialSyncToggle = (e) => {
    if (!pendingInitialSync) {
      setPendingInitialSync(true);
    }
    // If already true, do nothing (cannot uncheck)
  };

  const handleSave = async () => {
    const updatedData = {
      isInitialSyncCompleted: pendingInitialSync,
      bulkFetchBatchDuration: parseInt(syncDuration),
      bulkBatchSize: parseInt(syncRecords),
      pollingDuration: parseInt(pollingDuration)
    };
    await integrationService.updateIntegration({integrationId: integration.name, integrationData:updatedData})
    // Update the integration in the parent state
    setIntegrations(prev =>
      prev.map(i => i.name === integration.name ? { ...i, ...updatedData } : i)
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <IoSettingsOutline className="w-6 h-6 text-gray-600" />
            {integration?.name || 'Integration'} Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-4">
            <img src={integration?.logo} alt={integration?.name} className="w-12 h-12 rounded bg-white border" />
            <div>
              <div className="font-semibold text-gray-900">{integration?.name}</div>
              <div className="text-sm text-gray-500">Status: {integration?.connected ? 'Connected' : 'Not Connected'}</div>
            </div>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ping Status</label>
            <div className="text-gray-800 font-mono bg-gray-50 rounded px-2 py-1 inline-block">{integration?.pinStatus}</div>
          </div> */}
          {/* Initial Data Sync Toggle and Inputs */}
          <div className="flex items-center justify-between mt-4">
            <label className="block text-sm font-medium text-gray-700">Initial Data Sync</label>
            <input
              type="checkbox"
              checked={pendingInitialSync}
              onChange={handleInitialSyncToggle}
              className="w-5 h-5 accent-green-600"
              disabled={pendingInitialSync}
            />
          </div>
          {pendingInitialSync && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={syncDuration}
                  onChange={e => setSyncDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Records</label>
                <input
                  type="number"
                  min="1"
                  value={syncRecords}
                  onChange={e => setSyncRecords(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. 1000"
                />
              </div>
            </div>
          )}
          {/* Polling Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polling Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={pollingDuration}
              onChange={e => setPollingDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g. 5"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6">
          <Button onClick={onClose} variant="outline">Close</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationSettingsModal;
