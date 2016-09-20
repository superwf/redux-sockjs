/* remove item from array
 * @param {Array} array
 * @param {Any} target
 * @return {Boolean}
 * */
const remove = (array, target) => {
  const index = array.findIndex(item => target === item)
  if (index > -1) {
    array.splice(index, 1)
    return true
  }
  return false
}

export default remove
