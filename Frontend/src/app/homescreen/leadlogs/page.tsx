"use client";
import React, { useEffect, useState } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import ExpandableData from '@/components/ExpandableData';
import { fetchLeadLogs, LeadLog } from '@/api/leadlogs';

export default function LeadLogsPage() {
  const [logs, setLogs] = useState<LeadLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<LeadLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add state for modal position
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Drag handlers
  function onModalMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - modalPos.x, y: e.clientY - modalPos.y });
  }
  useEffect(() => {
    if (dragging) {
      function onModalMouseMove(e: MouseEvent) {
        if (dragging && dragStart) {
          setModalPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
      }
      function onModalMouseUp() {
        setDragging(false);
        setDragStart(null);
      }
      window.addEventListener('mousemove', onModalMouseMove);
      window.addEventListener('mouseup', onModalMouseUp);
      return () => {
        window.removeEventListener('mousemove', onModalMouseMove);
        window.removeEventListener('mouseup', onModalMouseUp);
      };
    }
  }, [dragging, dragStart]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const logsData = await fetchLeadLogs();
        setLogs(logsData.data?.results || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs. Check your connection.");
        // Do not fall back to empty array
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const handleViewLog = (lead_id: number) => {
    const found = logs.find(l => l.lead_id === lead_id);
    setSelectedLog(found || null);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'lead_type', label: 'Lead Type' },
    { key: 'source', label: 'Source' },
  ];

  // Add type guard for nested data
  const hasDataObject = selectedLog && typeof selectedLog.data === 'object' && !Array.isArray(selectedLog.data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-0 flex">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-yellow-900">Lead Logs</h1>
        {loading && <div className="mb-4 text-yellow-700">Loading...</div>}
        {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}
        <Card className="overflow-x-auto">
          <Table
            columns={columns}
            data={logs}
            actions={log => (
              <Button variant="primary" onClick={() => handleViewLog(log.lead_id)}>
                View
              </Button>
            )}
          />
        </Card>
        {/* Log Details Modal */}
        {selectedLog && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedLog(null)} aria-label="Close log details" />
            <div
              className={`fixed z-50 flex items-center justify-center pointer-events-none`}
              style={{ left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
            >
              <div
                className={`relative w-[350px] h-[350px] max-w-2xl min-w-[250px] min-h-[200px] max-w-[90vw] max-h-[90vh] p-8 rounded-2xl shadow-2xl border border-black bg-white resize-both overflow-auto pointer-events-auto`}
                style={{
                  resize: 'both',
                  overflow: 'auto',
                  transform: `translate(${modalPos.x}px, ${modalPos.y}px)`
                }}
                id="log-details-modal-box"
              >
                <div
                  className="modal-drag-handle cursor-move flex items-center gap-2 mb-8 select-none"
                  onMouseDown={onModalMouseDown}
                  style={{ userSelect: 'none' }}
                >
                  <h2 className="text-3xl font-extrabold text-black flex items-center gap-2">
                    Log Details
                  </h2>
                  <span className="ml-auto" />
                  <button
                    className="text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                    onClick={() => setSelectedLog(null)}
                    aria-label="Close log details"
                  >×</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  {Object.entries(selectedLog).map(([key, value], idx) => (
                    key !== 'data' && key !== 'success' && key !== 'message' ? (
                      <div key={key + '-' + idx} className="flex flex-col border-b pb-1 gap-1">
                        <span className="text-sm font-semibold text-black">{key.replace(/_/g, ' ')}:</span>
                        {key === 'id' || key === 'leadlog_id' ? (
                          <span className="text-base font-medium text-black truncate" title={String(value)}>{
                            value === null ||
                            value === undefined ||
                            String(value).trim() === '' ||
                            String(value).toLowerCase() === 'null' ||
                            String(value).toLowerCase() === 'undefined'
                              ? 'None'
                              : String(value)
                          }</span>
                        ) : (
                          <div className="text-base font-medium text-black">
                            {value === null || value === undefined || String(value).trim() === '' || String(value).toLowerCase() === 'null' || String(value).toLowerCase() === 'undefined' ? (
                              'None'
                            ) : typeof value === 'object' ? (
                              <ExpandableData data={value} label={key.replace(/_/g, ' ')} />
                            ) : (
                              String(value)
                            )}
                          </div>
                        )}
                      </div>
                    ) : null
                  ))}
                  {hasDataObject && (
                    <div className="col-span-2 mt-4">
                      <h3 className="text-lg font-bold mb-2 text-black">Data</h3>
                      {Object.entries(selectedLog.data as Record<string, unknown>).map(([k, v], i) => (
                        <div key={k + '-' + i} className="flex flex-col border-b pb-1 gap-1 pl-4">
                          <span className="text-sm font-semibold text-black">{k.replace(/_/g, ' ')}:</span>
                          <div className="text-base font-medium text-black">
                            {v === null || v === undefined || String(v).trim() === '' || String(v).toLowerCase() === 'null' || String(v).toLowerCase() === 'undefined' ? (
                              'None'
                            ) : typeof v === 'object' ? (
                              <ExpandableData data={v} label={k.replace(/_/g, ' ')} />
                            ) : (
                              String(v)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Shrink/Expand Arrow */}
                <button
                  className="absolute bottom-2 right-2 bg-yellow-200 hover:bg-yellow-300 text-black rounded-full p-1 shadow border border-black"
                  style={{ zIndex: 10 }}
                  title="Shrink/Expand"
                  onClick={() => {
                    const box = document.getElementById('log-details-modal-box');
                    if (box) {
                      const isMax = box.classList.toggle('maximized');
                      if (isMax) {
                        box.style.width = '90vw';
                        box.style.height = '90vh';
                      } else {
                        box.style.width = '';
                        box.style.height = '';
                      }
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v4h4M16 8V4h-4" /><path d="M16 4l-6 6M4 16l6-6" /></svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 