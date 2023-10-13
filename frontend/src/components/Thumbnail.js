import React from "react";

export default function Thumbnail({
  data,
  directory,
  zone,
  highLight,
  focusOnChip,
  unfocusOnChip,
}) {
  return (
    <div className="thumbnail-cont">
      {Object.keys(data).map((key, i) => (
        <img
          key={i}
          className="thumbnail"
          onClick={() => highLight(key, zone, data)}
          onMouseEnter={(e) => focusOnChip(e, key, zone)}
          onMouseLeave={() => unfocusOnChip(key, zone)}
          src={`${process.env.REACT_APP_API}${
                directory.split("backend")[1]}/${
                data[key].ng_g === "1" ? "real" : "pred"}/${
                data[key].fname}`}
          style={{ border: data[key].border }}
          alt={data[key].fname}
        />
      ))}
    </div>
  );
}
