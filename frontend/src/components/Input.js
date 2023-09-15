import React from 'react'

export default function Input({ css, text, onChange }) {
  return (
    <label className={css}>{text}
        <input 
        className="focus:outline-none text-gray-600"
        type="file"
        accept=".png, .jpg, .jpeg"
        id="image"
        onClick={(event)=> { 
            event.currentTarget.value = ""
        }}
        onChange={onChange}
        hidden/>
    </label>
  )
}
