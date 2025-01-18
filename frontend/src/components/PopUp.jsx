import React, { useState, useRef, useEffect } from "react";

const Popup = ({
  children,
  content,
  position = "top",
  trigger = "hover", // 'hover' or 'click'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible && trigger === "click") {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, trigger]);

  const getPositionClasses = () => {
    const positions = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };
    return positions[position] || positions.top;
  };

  const handleInteraction = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div
      ref={popupRef}
      className="relative inline-block"
      onClick={handleInteraction}
      onMouseEnter={() => trigger === "hover" && setIsVisible(true)}
      onMouseLeave={() => trigger === "hover" && setIsVisible(false)}
    >
      {/* Trigger element */}
      <div
        className={`inline-block ${
          trigger === "click" ? "cursor-pointer" : ""
        }`}
      >
        {children}
      </div>

      {/* Popup content */}
      {isVisible && (
        <div
          className={`
              absolute z-50 
              bg-white rounded-lg shadow-lg 
              p-4 min-w-[200px]
              border border-gray-200
              ${getPositionClasses()}
            `}
        >
          {content}
          {/* Arrow */}
          <div
            className={`
                absolute w-3 h-3 
                bg-white 
                transform rotate-45 
                border-gray-200
                ${
                  position === "top"
                    ? "border-b border-r bottom-[-6px] left-1/2 -translate-x-1/2"
                    : position === "bottom"
                    ? "border-t border-l top-[-6px] left-1/2 -translate-x-1/2"
                    : position === "left"
                    ? "border-t border-r right-[-6px] top-1/2 -translate-y-1/2"
                    : "border-b border-l left-[-6px] top-1/2 -translate-y-1/2"
                }
              `}
          />
        </div>
      )}
    </div>
  );
};

export default Popup;
