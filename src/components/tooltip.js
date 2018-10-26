import React from 'react';
import './tooltip.css';

export default (props) => {
  
  function renderIcon () {
    if (props.type === "dragicon"){
      return "/img/move.svg"
    } else if (props.type === "downloadicon"){
      return "/img/download.svg"
    } else if (props.type === "closeicon"){
      return "/img/cross.svg"
    } else if (props.type === "information"){
      return "/img/information.svg"
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
