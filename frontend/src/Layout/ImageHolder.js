import React from 'react'
import PanAndZoomImage from '../Components/PanAndZoom'

export default function ImageHolder({ mainImage, ngChips, focus, setFocus }) {
  return (
    <div className='imageholder'>
      {mainImage.src ? 
        <PanAndZoomImage  mainImage={mainImage}
                          chips={ngChips}
                          focus={focus}
                          setFocus={setFocus} />
        :<section className='placeholder' />}
    </div>
  )
}
