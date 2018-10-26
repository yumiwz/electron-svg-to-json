import React, { Component } from 'react';
import './App.css';
import Box from './components/box'
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;
const getSvgFile = require('./modules/getSvgFile')
const path = require('path')
const dialog = electron.remote.dialog 

class App extends Component {

  state = {
    results: [],
    filePath: '',
    newFilePath: '',
    initialClasses: '',
    transitionClasses: '',
    ondrag: false,
    counter: 0,
    error: {
      empty: false,
      notAfolder: false,
      notSvgfolder: false
    }
  }

  getSvgFiles = file => fileName => {
    fs.statSync(file)
    const params = {
      fileName,
      file: path.join(file, fileName)
    }
      return getSvgFile(params)
  }
  
  readJsonFiles = (filenames, filePath) => {
    fs.statSync(filePath)
      return Promise.all(filenames.map(this.getSvgFiles(filePath)));
  }

  onWriteToFileSystem = (e) => {
    e.preventDefault();
  
    for (let f of e.dataTransfer.files) {
      // ipcRenderer.send('ondragstart', f.path)
      let filepath = f.path

      const droppedItem = fs.statSync(filepath)

      if(droppedItem.isDirectory()){

        this.readDirectory(f, filepath)

        this.setState({
          error: {
            empty: false,
            notAfolder: false
          },
          ondrag: false,
          counter: 0
        })

      } else {
        this.setState({
          error: {
            empty: false,
            notAfolder: true
          },
          ondrag: false,
          counter: 0
        })
      }
    }
      return false;
  }

    readDirectory = (f, filepath) => {
      
    fs.readdir(f.path, (err, files) => {

      console.log("files", files)
      if(err){
        console.log(err)
      } else {
        if (!files.length){
          this.setState(({
            error: {
              empty: true,
              notAfolder: false
            },
            ondrag: false,
          counter: 0
          }))
        } else if (!this.checkIsValidSvg(files)) {
          this.setState(({
            error: {
              empty: false,
              notAfolder: false,
              notSvgfolder: true
            },
            ondrag: false,
          counter: 0
          }))
        } else {
          this.setState({
            error: {
              empty: false,
              notAfolder: false
            }
          })

          let finalFileName = filepath.substr(filepath.lastIndexOf('\\') + 1) + '.js'
          this.setState({newFilePath: finalFileName})
          fs.readdir(f.path, 'utf-8', (err, data) => {
            if (err) {
              console.log('error', err)
            }
            
            this.readJsonFiles(data, f.path).then( (results) => {

              this.setState({
                filePath: `${filepath}.js`,
                fileName: finalFileName,
                results: results
              })
      
              this.setState({styles: "transition"})
            }, function (err) {
              console.log('error', err)
            })
          })
        }
      }
    })
  }

  checkIsValidSvg = files => {
    return files.every(file => file.split('.').pop() === "svg")
  }

  writeFile = (filePath, result) => {
    fs.writeFile(filePath, "export default " + JSON.stringify(result, null, 2), (err) => {
      if (err) {
        this.setState({ error: 'could not save file '})
      }           
    });
  }

  onIconClick = (event, id) => {
    if (id === 'close-button-target') {
      this.handleClose()
    } else if (id === 'download-button-target') {
      this.handleDownload()
    }
  }

  handleClose = () => {
    this.setState({newFilePath: '', styles: "transitionBack"})
  }

  handleDownload = () => {
    dialog.showSaveDialog(
      { 
        defaultPath: this.state.newFilePath,
        filters: [
          { name: 'JSON', extensions: ['js'] }
        ]
      },
      (filePath) => {
        if (filePath === undefined){
            console.log("You didn't save the file");
            return;
        }
        this.writeFile(filePath, this.state.results)
      }); 
  }

  handleDragDownload = (event) => {

      event.preventDefault()

      ipcRenderer.send('ondragstartfile', this.state.filePath)

      this.writeFile(this.state.filePath, this.state.results)
           
  }

  onDragBoxEnter = (e) => {
    e.preventDefault();
    this.setState({ondrag: true, counter: this.state.counter + 1})
  }

  onDragBoxLeave = (e) => {
    this.setState({ondrag: false, counter: this.state.counter - 1})
  }

  render() {
    const initialClasses = {
      dragbox: 'drag',
      icons: 'icon-button',
      dragfile: 'dragtarget',
      notafolder: 'notafolder',
      emptyfolder: 'emptyfolder',
      svgfolder: 'svgfolder',
      iconrow: 'icon-row-before'
    }
    const transitionClasses = {
      dragbox: 'drag-transition',
      icons: 'icon-button-after',
      dragfile: 'drag-button',
      notafolder: 'notafolder',
      emptyfolder: 'emptyfolder',
      svgfolder: 'svgfolder',
      iconrow: 'icon-row'
    }
    const dragClass = {
      dragbox: 'drag-class',
      icons: 'icon-button',
      dragfile: 'dragtarget',
      notafolder: 'notafolder',
      emptyfolder: 'emptyfolder',
      svgfolder: 'svgfolder',
      iconrow: 'icon-row-before'
    }
    const foldererrorClass = {
      dragbox: 'drag',
      icons: 'icon-button',
      dragfile: 'dragtarget',
      notafolder: 'notafolder-error',
      emptyfolder: 'emptyfolder',
      svgfolder: 'svgfolder',
      iconrow: 'icon-row-before'
    }
    const emptyerrorClass = {
      dragbox: 'drag',
      icons: 'icon-button',
      dragfile: 'dragtarget',
      notafolder: 'notafolder',
      emptyfolder: 'emptyfolder-error',
      svgfolder: 'svgfolder',
      iconrow: 'icon-row-before'
    }
    const svgerrorClass = {
      dragbox: 'drag',
      icons: 'icon-button',
      dragfile: 'dragtarget',
      notafolder: 'notafolder',
      emptyfolder: 'emptyfolder',
      svgfolder: 'svgfolder-error',
      iconrow: 'icon-row-before'
    }
    return (
      <div className="App">
          <Box 
            onDrop={this.onWriteToFileSystem} 
            onClick={this.onIconClick} 
            onDrag={this.handleDragDownload}
            onDragBoxEnter={this.onDragBoxEnter}
            onDragBoxLeave={this.onDragBoxLeave}
            onDragClass={this.dragClass}
            text='trallala' 
            filepath={this.state.newFilePath} 
            styles={
                this.state.newFilePath !== '' ? transitionClasses
              : this.state.counter !== 0 ? dragClass
              : this.state.error.notAfolder ? foldererrorClass
              : this.state.error.empty ? emptyerrorClass
              : this.state.error.notSvgfolder ? svgerrorClass
              : initialClasses} 
            />
      </div>
    );
  }
}

export default App;
