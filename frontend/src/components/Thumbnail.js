import React from 'react'

export default function Thumbnail({data, directory, zone, highLight, focusOnChip, unfocusOnChip}) {
  return (
    <div className="thumbnail-cont" >
      {Object.keys(data).map((key, i) => 
      <img 
        key={i}
        className="thumbnail"
        onClick={() => highLight(key, zone, data)}
        onMouseEnter={e => focusOnChip(e, key, zone)}
        onMouseLeave={() => unfocusOnChip(key, zone)}
        src={directory + "/Temp/" + data[key].filename}
        style={{border:data[key].borde}}
        alt={data[key].filename} /> 
      )}
  </div>
  )
}
