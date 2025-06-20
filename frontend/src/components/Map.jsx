import rosController from "../utils/rosClient";

const Map = () => {
  const handleElementMount = (ele) => {
    if (ele) {
      // eslint-disable-next-line no-unused-vars
      const { viewer, navClient } = rosController.createMapViewer();
    }
  };

  return (
    <div>
      <div ref={handleElementMount} id="map"></div>
    </div>
  );
};

export default Map;
