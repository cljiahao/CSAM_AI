import React from 'react'
import Thumbnail from './Thumbnail'

const TBZone = ({data, directory, highLight,focusOnChip,unfocusOnChip}) => (
  <div className="zone-cont">
      {Object.keys(data).map((key, i) => 
      <div 
        key={i}
        className="" >
        <p className="zone">{key}</p>
            {data[key] && <Thumbnail data={data[key]}
            zone={key}
            directory={directory}
            highLight={highLight}
            focusOnChip={focusOnChip}
            unfocusOnChip={unfocusOnChip}
            />}
        </div>
        )
      }

  </div>
)

export default TBZone