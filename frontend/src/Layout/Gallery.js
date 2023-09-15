import React from 'react'
import TBZone from '../Components/TBZone'

export default function Gallery({ array, data, info, focus, setArray, setInfo, setData, setFocus }) {

  const FOCUS_SCALE = process.env.REACT_APP_FOCUS_SCALE || 5
  const marker = {
    color:  {default: null, zoom: "chartreuse", highlight: "yellow", highlight2: "aqua"},
    radius: {default: null, zoom: 10, highlight: 1},
    bord: {default: null, highlight: "2px solid red"}
  }
  const ngChips = data.ngChips

  const highLight = (key, zone) => {
    let target = ngChips[zone][key]
    if (target.color === "chartreuse" || target.color == null){
        target.color = marker.color.highlight
        target.markerRadius = marker.radius.highlight
        target.borde = marker.bord.highlight
        setArray({...array, [target.filename]: target.filename})
        let count = info.actual
        setInfo({...info,actual:count+1})
        setData({...data, data: {...ngChips, [key]: target}})
    } else if (target.color === "yellow"){
        target.color = marker.color.highlight2
        delete array[target.filename]
        setArray(array)
        setData({...data, data: {...ngChips, [key]: target}})
    } else if (target.color === "aqua"){
        target.color = marker.color.default
        target.markerRadius = marker.radius.default
        target.borde = marker.bord.default
        let count = info.actual
        setInfo({...info,actual:count-1})
        setData({...data, data: {...ngChips, [key]: target}})
    }
  }

  const focusOnChip = (e, key, zone) => {
    const info = e.target.alt.split(".")[0]
    const [x, y]  = info.split('_').slice(-2)
    setFocus({...focus, state:true, x:x, y:y, scale: FOCUS_SCALE})
    let target = ngChips[zone][key]
    if (target.color == null){
     target.color = marker.color.zoom
     target.markerRadius = marker.radius.zoom
     setData({...data, data: {...ngChips, [key]: target}})
    }
 }

 const unfocusOnChip = (key, zone) => {
     setFocus({...focus, state:false, x:0, y:0, scale: 1})
     let target = ngChips[zone][key]
     if (target.color === "chartreuse"){
         target.color = marker.color.default
         target.markerRadius = marker.radius.default
         setData({...data, data: {...ngChips, [key]: target}})
     }
 }

  return (
    <aside className='gallery'>
      {ngChips && <TBZone data={ngChips} 
              directory={data.baseUrl} 
              highLight={highLight} 
              focusOnChip={focusOnChip}
              unfocusOnChip={unfocusOnChip} />}
    </aside>
  )
}
