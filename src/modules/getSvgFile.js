const electron = window.require('electron');
const fs = electron.remote.require('fs');
const svgson = require('svgson')
const { removeFileEnding } = require('./util')

module.exports = ({ fileName, file }) => {
  return new Promise(resolve => {
    fs.readFile(file, 'utf-8', (err, svg) => {
      if (err) {
        console.log('could not read from file', err)
      }

      const params = {
        title: removeFileEnding(fileName)
      }

      svgson(
        svg,
        params,
        result => resolve(result)
      )
    })
  })
}