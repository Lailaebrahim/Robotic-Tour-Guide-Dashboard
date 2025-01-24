import React, { useState } from "react";
import { MapPin, Volume2, ChevronRight } from "lucide-react";

const TourPOIsDisplay = ({ isAudioGenerated, museumMap }) => {
  const [expandedPOI, setExpandedPOI] = useState(null);

  const handlePOIClick = (poiKey) => {
    setExpandedPOI(expandedPOI === poiKey ? null : poiKey);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-m font-semibold mb-4">Tour Map</h3>

      <div className="space-y-3">
        {Object.entries(museumMap).map(([poiKey, poi]) => (
          <div
            key={poiKey}
            className="bg-white/5 rounded-lg overflow-hidden border border-white/10 transition-all duration-200 hover:border-white/20"
          >
            {/* POI Header - Always visible */}
            <div
              onClick={() => handlePOIClick(poiKey)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{poi.name}</span>
              </div>
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-200 ${
                  expandedPOI === poiKey ? "rotate-90" : ""
                }`}
              />
            </div>

            {/* Expanded Content */}
            {expandedPOI === poiKey && (
              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                {/* Description */}
                <p className="text-sm text-gray-300 mb-4">{poi.description}</p>

                {/* Audio Section */}
                {isAudioGenerated ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <audio controls className="ml-2">
                      <source src={poi.audio} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : null}

                {/* Location Details */}
                <div className="mt-4 p-3 bg-white/5 rounded-md text-sm">
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>
                      <span className="text-gray-400">Position:</span>
                      <div className="mt-1">
                        X: {poi.position.pose.position.x}
                        <br />
                        Y: {poi.position.pose.position.y}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Orientation:</span>
                      <div className="mt-1">
                        Z: {poi.position.pose.orientation.z}
                        <br />
                        W: {poi.position.pose.orientation.w}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourPOIsDisplay;
