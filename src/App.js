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
      noSvgInFolder: false
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
  
  readJsonFiles = (filenames, filepath) => {
    let filterSvg = this.filterSvg(filenames)
    fs.statSync(filepath)
    return Promise.all(filterSvg.map(this.getSvgFiles(filepath)));
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
        } else if (this.filterSvg(files).length === 0) {
          console.log("NO SVG")
          this.setState(({
            error: {
              noSvgInFolder: true
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

          // const test = path.basename(filepath)
          const fileName = filepath.replace(/^.*[\\/]/, '')

          this.setState({ newFilePath: `${fileName}.js` })

          fs.readdir(f.path, 'utf-8', (err, data) => {
            if (err) {
              console.log('error', err)
            }

              this.readJsonFiles(data, f.path).then( (results) => {
  
                this.setState({
                  filePath: `${filepath}.js`,
                  results: results,
                  styles: 'transition'
                })
              }, function (err) {
                console.log('error', err)
              })  
            
          })
        }
      }
    })
  }

  filterSvg = files => {
    return files.filter(file => file.split('.').pop() === "svg")
  }

  writeFile = (filepath, result) => {
    fs.writeFile(filepath, "export default " + JSON.stringify(result, null, 2), (err) => {
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
      (filepath) => {
        if (filepath === undefined){
            console.log("You didn't save the file");
            return;
        }
        this.writeFile(filepath, this.state.results)
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

    console.log('this.state', this.state)
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
              : this.state.error.noSvgInFolder ? svgerrorClass
              : initialClasses} 
            />
      </div>
    );
  }
}

export default App;
