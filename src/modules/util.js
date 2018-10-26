const removeFileEnding = fileName => {
  return fileName.split('.')[0]
}

module.exports = {
  removeFileEnding
}