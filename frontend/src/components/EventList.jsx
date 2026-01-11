import React, { useEffect, useState } from 'react';
import { useDisasterStore } from '../store';
import { FiEye, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const SeverityBadge = ({ level }) => {
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[level] || ''}`}>
      {level}
    </span>
  );
};

export default function EventList() {
  const { events, loading, fetchEvents, verifyEvent } = useDisasterStore();
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleVerify = async (eventId) => {
    await verifyEvent(eventId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Disaster Events</h1>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiAlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {event.disaster_type.toUpperCase()}
                    </h2>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                  <SeverityBadge level={event.severity_level} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Severity Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {event.severity_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="flex items-center text-lg font-semibold">
                      {event.is_verified ? (
                        <>
                          <FiCheckCircle className="text-green-600 mr-2" />
                          Verified
                        </>
                      ) : (
                        <>
                          <FiAlertCircle className="text-yellow-600 mr-2" />
                          Pending
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reported By</p>
                    <p className="text-sm font-mono text-gray-800">
                      {event.reported_by?.substring(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm text-gray-800">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {event.ai_predictions && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      AI Analysis
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        Low: {(event.ai_predictions.low * 100).toFixed(1)}%
                      </div>
                      <div>
                        Medium: {(event.ai_predictions.medium * 100).toFixed(1)}%
                      </div>
                      <div>
                        High: {(event.ai_predictions.high * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <FiEye className="mr-2" />
                    View Details
                  </button>
                  {!event.is_verified && (
                    <button
                      onClick={() => handleVerify(event.id)}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      <FiCheckCircle className="mr-2" />
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
