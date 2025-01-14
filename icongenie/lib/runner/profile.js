const { resolve, dirname, basename, isAbsolute, relative } = require('path')
const { writeFileSync } = require('fs')
const { ensureDir } = require('fs-extra')

const { log } = require('../utils/logger')
const modes = require('../modes')
const validateProfileObject = require('../utils/validate-profile-object')

function getParams ({ include, ...props }) {
  if (include) {
    props.include = include.split(',')
  }

  return props
}

function getAssets (assets) {
  let list = []

  assets.forEach(name => {
    list = list.concat(modes[name].assets)
  })

  return list
}

function getTargetFilepath (output) {
  const folder = dirname(output)
  const name = basename(output)

  const prefix = name.startsWith('icongenie-')
    ? ''
    : 'icongenie-'

  const suffix = name.endsWith('.json')
    ? ''
    : '.json'

  const filename = `${prefix}${name}${suffix}`
  return resolve(process.cwd(), folder || '', filename)
}

module.exports = function profile ({ output, assets, ...params }) {
  const profile = {
    params: getParams(params),
    assets: getAssets(assets)
  }

  validateProfileObject(profile, true)

  if (profile.params.icon && isAbsolute(profile.params.icon) === false) {
    // generate icon path relative to app root
    // so it won't matter from where the profile file is run
    const { appDir } = require('../utils/app-paths')
    profile.params.icon = relative(appDir, profile.params.icon)
  }

  const targetFile = getTargetFilepath(output)
  const folderName = dirname(targetFile)

  if (folderName) {
    ensureDir(folderName)
  }

  writeFileSync(targetFile, JSON.stringify(profile, null, 2), 'utf-8')

  console.log(` Generated Icon Genie profile file:`)
  log(`${targetFile}\n`)
}
