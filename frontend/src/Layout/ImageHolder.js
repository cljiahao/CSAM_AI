import React from "react";
import PanAndZoomImage from "../components/PanAndZoom";

export default function ImageHolder({ main_image, ng_chips, focus, setFocus }) {
  return (
    <div className="imageholder">
      {main_image.src ? (
        <PanAndZoomImage
          main_image={main_image}
          ng_chips={ng_chips}
          focus={focus}
          setFocus={setFocus}
        />
      ) : (
        <section className="placeholder" />
      )}
    </div>
  );
}
