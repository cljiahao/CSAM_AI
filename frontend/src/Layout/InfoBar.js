import React from 'react'
import Input from '../Components/Input'

export default function InfoBar({ upload, info, lotNumber, filename }) {
  return (
    <aside className='infobar'>
        {/* <Button css="infobar-menu" text={<i className='bx bx-menu'></i>}/> */}
        <ul className='infobar-ul'>
          <li className="infobar-li">Lot Number: 
            <p className='inforbar-li-p'>{lotNumber}</p>
          </li>
          <li className="infobar-li">File: 
            <p className='inforbar-li-p'>{filename}</p>
          </li>
          <li className="infobar-li">NG chips: 
            <p className='inforbar-li-p'>{info.ngCounts} pcs</p>
          </li>
          <li className="infobar-li">Actual NG: 
            <p className='inforbar-li-p'>{info.actual} pcs</p>
          </li>
        </ul>
        <Input 
          css="infobar-upload" text="Upload Image" 
          onClick={(event)=> {event.currentTarget.value = ""}}
          onChange={upload}/>
    </aside>
  )
}
