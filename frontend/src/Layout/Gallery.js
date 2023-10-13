import React from "react";
import TBZone from "../components/TBZone";

export default function Gallery({
  array,
  data,
  info,
  focus,
  setArray,
  setInfo,
  setData,
  setFocus,
}) {
  const FOCUS_SCALE = process.env.REACT_APP_FOCUS_SCALE || 5;
  const marker = {
    color: {
      default: null,
      zoom: "chartreuse",
      highlight: "yellow",
    },
    radius: { default: null, zoom: 10, highlight: 1 },
    border: { default: null, highlight: "2px solid red" },
  };
  const ng_chips = data.ng_chips;

  const highLight = (key, zone) => {
    let target = ng_chips[zone][key];
    if (target.color === "chartreuse" || target.color == null) {
      target.color = marker.color.highlight;
      target.marker_radius = marker.radius.highlight;
      target.border = marker.border.highlight;
      setArray({ ...array, [target.fname]: target.fname });
      let count = info.real_ng;
      setInfo({ ...info, real_ng: count + 1 });
      setData({ ...data, data: { ...ng_chips, [key]: target } });
    } else if (target.color === "yellow") {
      target.color = marker.color.default;
      target.marker_radius = marker.radius.default;
      target.border = marker.border.default;
      delete array[target.fname];
      setArray(array);
      let count = info.real_ng;
      setInfo({ ...info, real_ng: count - 1 });
      setData({ ...data, data: { ...ng_chips, [key]: target } });
    }
  };

  const focusOnChip = (e, key, zone) => {
    const coords = e.target.alt.split(".")[0];
    const [x, y] = coords.split("_").slice(-2);
    setFocus({ ...focus, state: true, x: x, y: y, scale: FOCUS_SCALE });
    let target = ng_chips[zone][key];
    if (target.color == null) {
      target.color = marker.color.zoom;
      target.marker_radius = marker.radius.zoom;
      setData({ ...data, data: { ...ng_chips, [key]: target } });
    }
  };

  const unfocusOnChip = (key, zone) => {
    setFocus({ ...focus, state: false, x: 0, y: 0, scale: 1 });
    let target = ng_chips[zone][key];
    if (target.color === "chartreuse") {
      target.color = marker.color.default;
      target.marker_radius = marker.radius.default;
      setData({ ...data, data: { ...ng_chips, [key]: target } });
    }
  };

  return (
    <aside className="gallery">
      {ng_chips && (
        <TBZone
          ng_chips={ng_chips}
          directory={data.directory}
          highLight={highLight}
          focusOnChip={focusOnChip}
          unfocusOnChip={unfocusOnChip}
        />
      )}
    </aside>
  );
}
