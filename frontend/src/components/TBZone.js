import React from "react";
import Thumbnail from "./Thumbnail";

const TBZone = ({
  ng_chips,
  directory,
  highLight,
  focusOnChip,
  unfocusOnChip,
}) => (
  <div className="zone-cont">
    {Object.keys(ng_chips).map((key, i) => (
      <div key={i} className="">
        <p className="zone">{key}</p>
        {ng_chips[key] && (
          <Thumbnail
            data={ng_chips[key]}
            zone={key}
            directory={directory}
            highLight={highLight}
            focusOnChip={focusOnChip}
            unfocusOnChip={unfocusOnChip}
          />
        )}
      </div>
    ))}
  </div>
);

export default TBZone;
