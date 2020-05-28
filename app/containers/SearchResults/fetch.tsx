import { PackagePreview } from '../../components'
import React, { ReactElement } from 'react'
import { AptActions } from '../../actions'

const APIUrl = 'http://localhost:8000/'

export interface CVEInfoType {
  critical: number
  important: number
  low: number
}

const cveAPIInfo = {
  api: 'http://cve.circl.lu/api/search/',
  handleResult: (json: CVEInfoType) => json
}

const processDescription = (str: string) => {
  const cleared = str.replace(/^ \./gm, '\n').replace(/^ /gm, '')
  const upperCased = cleared.charAt(0).toUpperCase() + cleared.slice(1)
  const firstSentenceDotted = upperCased.replace(/\n/, '.\n')
  const lines = firstSentenceDotted.split('\n')
  lines[0] = lines[0] + '\n'
  return lines.join('')
}

export interface Package {
  [index: string]: string | undefined
  // Required fields
  name: string
  version: string
  flag?: string
  maintainer: string
  description: string
  // Optional fields
  section?: string
  priority?: string
  essential?: string
  architecture?: string
  origin?: string
  bugs?: string
  homepage?: string
  tag?: string
  source?: string
  depends?: string
  preDepends?: string
  recommends?: string
  suggests?: string
  breaks?: string
  conflicts?: string
  replaces?: string
  provides?: string
  installedSize?: string
  downloadSize?: string
  aptManualInstalled?: string
  aptSources?: string
}

type pkgRegexType = {
  required: {
    [index: string]: RegExp
  }
  optional: {
    [index: string]: RegExp
  }
}

const pkgRegex: pkgRegexType = {
  required: {
    name: /^Package: ([a-z0-9.+-]+)/m,
    version: /^Version: ((?<epoch>[0-9]{1,4}:)?(?<upstream>[A-Za-z0-9~.]+)(?:-(?<debian>[A-Za-z0-9~.]+))?)/m,
    // eslint-disable-next-line no-control-regex
    maintainer: /^Maintainer: ((?<name>(?:[\S ]+\S+)) <(?<email>(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)]))>)/m,
    description: /^Description-(?:[a-z]{2}): (.*(?:\n \S.*)*)/m
  },
  optional: {
    section: /^Section: ([a-z]+)/m,
    priority: /^Priority: (\S+)/m,
    essential: /^Essential: (yes|no)/m,
    architecture: /^Architecture: (.*)/m,
    origin: /^Origin: ([a-z0-9.+-]+)/m,
    bugs: /^Bugs: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/m,
    homepage: /^Homepage: (?:([a-z]+):\/\/)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/m,
    tag: /^Tag: ((?: ?[A-Za-z-+:]*(?:,(?:[ \n])?)?)+)/m,
    source: /^Source: ([a-zA-Z0-9-+.]+)/m,
    depends: /^Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    preDepends: /^Pre-Depends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    recommends: /^Recommends: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    suggests: /^Suggests: ((?:(?:(?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)(?: \| )?)+)/m,
    breaks: /^Breaks: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    conflicts: /^Conflicts: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    replaces: /^Replaces: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    provides: /^Provides: ((?:(?:[a-z0-9.+-]+(?: \((?:(?:<<|>>|<=|>=|=) (?:[0-9]{1,4}:)?(?:[A-Za-z0-9~.]+)(?:-(?:[A-Za-z0-9~.]+))?)\))?)(?:, )?)+)/m,
    installedSize: /^Installed-Size: (.*)/m,
    downloadSize: /^Download-Size: (.*)/m,
    aptManualInstalled: /^APT-Manual-Installed: (.*)/m,
    aptSources: /^APT-Sources: (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)(?: (?:\S+ ?)+))/m
  }
}

export const formPackagePreviews = async (
  searchQueryResults: string[],
  dispatch: AppDispatch
): Promise<ReactElement[]> => {
  const parsedPackages = []
  for (let i = 0; i < searchQueryResults.length; i++) {
    const newPackage: {
      [index: string]: string
    } = {}
    // Filling required fields
    if (
      !Object.keys(pkgRegex.required).every(key => {
        const match = pkgRegex.required[key].exec(searchQueryResults[i])
        if (match) newPackage[key] = match[1]
        else console.warn(`Missing ${key}`)
        return match
      })
    ) {
      console.warn(`Required fields are missing, skipping invalid package`, searchQueryResults[i])
      continue
    }

    // Filling optional fields
    Object.keys(pkgRegex.optional).forEach(key => {
      try {
        const match = pkgRegex.optional[key].exec(searchQueryResults[i])
        if (match) newPackage[key] = match[1]
      } catch (e) {
        console.error(e)
      }
    })

    parsedPackages.push(newPackage)
  }

  const resourceURL = new URL('assets/packages/', APIUrl).toString()

  // Fetch whole package info at once
  const info = await Promise.all(
    parsedPackages.map(({ name }) =>
      Promise.all([
        dispatch(AptActions.status(name)),
        cveAPIInfo.handleResult({ critical: 3, important: 41, low: 412 })
      ])
    )
  )

  return parsedPackages.map(({ name, version, description, ...rest }, i) => {
    const [installed, cveInfo] = info[i]
    return (
      <PackagePreview
        name={name}
        version={version}
        description={processDescription(description)}
        key={`${name}@${version}`}
        imageUrl={`${resourceURL}${name}.png`}
        cveInfo={cveInfo}
        installed={AptActions.status.fulfilled.match(installed)}
        {...rest}
      />
    )
  })
}