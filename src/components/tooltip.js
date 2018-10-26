import React from 'react';
import './tooltip.css';
import dragImg from "../img/move.svg"
import downloadImg from "../img/download.svg"
import closeImg from "../img/cross.svg"
import informationImg from "../img/information.svg"


export default (props) => {
  
  function renderIcon () {
    if (props.type === "dragicon"){
      return dragImg
    } else if (props.type === "downloadicon"){
      return downloadImg
    } else if (props.type === "closeicon"){
      return closeImg
    } else if (props.type === "information"){
      return informationImg
    }
  }

  const finalClasses = `${props.className} icon`

  const handleDrag = event => {
    console.log('event > handleDrag', event)
    event.preventDefault()
    props.onDrag(event)
    return false
  }

  return (
    <div
      id={props.id}
      className={props.id !== "info-icon" ? "alertbox" : null}
      onClick={(event) => {
        if (typeof props.onClick === 'function') {
          props.onClick(event, props.id)
        }
      }}
      onDragStart={handleDrag}
      onDragExit={event => {
        console.log('onDragEnd >>>', event)
        event.preventDefault()
        event.stopPropogation()
        return false
      }}
    >
      <img 
        alt="icon"
        draggable={props.draggable} 
        src={renderIcon()} 
        onMouseEnter={() => { props.onMouseMove(props.id) }} 
        onMouseOut={() => { props.onMouseMove(props.id) }} 
        className={finalClasses} 
      />
      {props.showBubble && <span className="tooltipjs"> {props.text}</span>}
    </div>
  )
}
