import React from 'react'
import './box.css'
import Tooltip from './tooltip'

class Box extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltips: [
        {
          id: 'drag-button-target',
          text: 'drag your file on your file system',
          icon: 'dragicon',
          visible: false,
          draggable: true
        },
        {
          id: 'download-button-target',
          text: 'click to choose where to save the file on your file system',
          icon: 'downloadicon',
          visible: false,
          draggable: false
        },
        {
          id: 'close-button-target',
          text: null,
          icon: 'closeicon',
          visible: false,
          draggable: false
        }
      ],
      visible: false
    }
    this.toggleBubble = this.toggleBubble.bind(this);
    this.toggleBubbleSingle = this.toggleBubbleSingle.bind(this);
  }

  toggleBubble(id) {
    this.setState({
      tooltips: this.state.tooltips.map(tooltip => {
        if (id === tooltip.id && tooltip.text != null) {
          return {
            ...tooltip,
            visible: !tooltip.visible
          } 
        }
        return tooltip
      })
    })
  }

  toggleBubbleSingle(id) {
      this.setState({visible: !this.state.visible})
  }

  render(){

    return(
      <div onDragOver={e => {
        e.preventDefault()
        return false
      }}>
        <p onClick={event => {this.props.onClick(event)}} id="headline"> 
          SVG to JSON 
        </p>
        <p id="notafolder" className={this.props.styles.notafolder}>
          Not a folder!
        </p>
        <p id="emptyfolder" className={this.props.styles.emptyfolder}>
          Empty folder!
        </p>
        <div 
          className={this.props.styles.dragbox} 
          onDragEnter={this.props.onDragBoxEnter} 
          onDragLeave={this.props.onDragBoxLeave}
          onDrop={this.props.onDrop} >
          <p>drag your folder here</p>
          <img alt="dragicon" src="/img/folder.svg" id="folder-icon" draggable="false" />
        </div>
        <div className={this.props.styles.iconrow}>
        {
          this.state.tooltips && this.state.tooltips.map((tooltip, index) => (
            <Tooltip 
              key={index}
              id={tooltip.id}
              className={this.props.styles.icons}
              text={tooltip.text}
              type={tooltip.icon} 
              onMouseMove= {this.toggleBubble} 
              showBubble={tooltip.visible} 
              onMouseLeave={this.toggleBubble}
              draggable={tooltip.draggable}
              onClick={(event, id) => this.props.onClick(event, id)}
              onDrag={(event, id) => this.props.onDrag(event, id)}
              onDownload={this.props.onDownload}
            />
          ))
        }
        </div>
        {this.props.filepath}
        <div id="dragtarget" draggable="true" className={this.props.styles.dragfile}>
          <img 
            alt="dragicon" 
            className="file-svg" 
            src="/img/document-new.svg" 
            onDragStart={event => this.props.onDrag(event)} 
          />
        </div>
        <Tooltip
              id="info-icon"
              className="info-icon"  
              text="This app was made to transform your folder with svg files into a JSON file." 
              type="information" 
              onMouseMove={this.toggleBubbleSingle} 
              showBubble={this.state.visible} 
              draggable ={false}
        />
      </div>
    )
  }
}
export default Box