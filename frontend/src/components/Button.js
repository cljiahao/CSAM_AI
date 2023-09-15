import React from 'react'

export default function Button({ css, onClick, text }) {
  return (
    <button className={css} onClick={onClick}>{text}</button>
  )
}
