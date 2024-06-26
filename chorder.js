autowatch = 1

inlets = 1
outlets = 1
var debugLog = true

setinletassist(0, '<Bang> to initialize')
setoutletassist(0, '<String> Message to display')

function debug() {
  if (debugLog) {
    post(
      debug.caller ? debug.caller.name : 'ROOT',
      Array.prototype.slice.call(arguments).join(' '),
      '\n'
    )
  }
}

var state = {
  chordDevice: null,
  shiftParams: [],
}

debug('reloaded')

function bang() {
  state.chordDevice = null
  state.shiftParams = []
  var thisDevice = new LiveAPI('live_set this_device')
  var parentDevice = new LiveAPI(thisDevice.get('canonical_parent'))

  //debug(thisDevice.id)
  var parentChildren = parentDevice.get('devices')

  var foundDeviceIdx = null
  for (var i = 0; i < parentChildren.length / 2; i++) {
    var childDeviceId = parentChildren[i * 2 + 1].toString()
    //debug('PC=' + childDeviceId)
    if (childDeviceId === thisDevice.id) {
      foundDeviceIdx = i
      //debug('FOUND idx=' + foundDeviceIdx)
      nextDeviceId = parentChildren[(i + 1) * 2 + 1].toString()
      //debug('NEXT DEVICE=' + nextDeviceId)
      var nextDevice = new LiveAPI('id ' + nextDeviceId)
      if (!nextDevice) {
        outlet(0, 'No next device.')
        return
      }
      //debug('CLass_NAME=' + nextDevice.get('class_name'))
      if (nextDevice.get('class_name').toString() !== 'MidiChord') {
        outlet(0, 'Next device is not a MidiChord.')
        return
      }
      state.chordDevice = nextDevice
      outlet(0, 'Giddyup.')
      mapParams()
      resetChord()
      return
    }
  }
  outlet(0, 'Hmm. I wish I knew.')
}

function mapParams() {
  if (!state.chordDevice) {
    debug('No chord device in state')
    return
  }

  var paramIds = state.chordDevice.get('parameters').filter(function (p) {
    return p !== 'id'
  })

  var paramObj = null
  var paramName = null
  for (var i = 0; i < paramIds.length; i++) {
    paramObj = new LiveAPI('id ' + paramIds[i].toString())
    paramName = paramObj.get('name').toString()
    //debug(paramObj.get('name'))
    if (paramName === 'Shift1') {
      //debug('Found Shift1 ' + paramIds[i])
      state.shiftParams[0] = paramObj
    }
    if (paramName === 'Shift2') {
      //debug('Found Shift2 ' + paramIds[i])
      state.shiftParams[1] = paramObj
    }
    if (paramName === 'Shift3') {
      //debug('Found Shift3 ' + paramIds[i])
      state.shiftParams[2] = paramObj
    }
    if (paramName === 'Shift4') {
      //debug('Found Shift4 ' + paramIds[i])
      state.shiftParams[3] = paramObj
    }
    if (paramName === 'Shift5') {
      //debug('Found Shift5 ' + paramIds[i])
      state.shiftParams[4] = paramObj
    }
    if (paramName === 'Shift6') {
      //debug('Found Shift6 ' + paramIds[i])
      state.shiftParams[5] = paramObj
    }
  }
}

function setChord(arr) {
  if (state.shiftParams.length !== 6) {
    debug('No params')
    return
  }
  for (var i = 0; i < 6; i++) {
    state.shiftParams[i].set('value', arr[i] || 0)
  }
}

function resetChord() {
  setChord([])
}

var noteToArr = {
  24: [4, 7],
  25: [3, 7],
  26: [4, 7, 11],
  27: [3, 7, 11],
}

function note(num, vel) {
  if (vel === 0) {
    return resetChord()
  }

  var arr = noteToArr[num]
  if (arr) {
    setChord(arr)
  }
}
