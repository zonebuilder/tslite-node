/*
	TSLite - converts your valid JavaScript to TypeScript v0.5.0
	Copyright (c) 2022 The Zonebuilder <zone.builder@gmx.com>
	https://github.com/zonebuilder/tslite-node
	License: MIT
*/
/* tslite-remove: begin */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*eslint no-useless-escape: "off"*/
/* tslite-remove: end */
/* tslite-add: (() => { */
'use strict'
const fs = require('fs')
const path = require('path')
const tslite = require('./lib/tslite')
const pakg = require('../package.json')
const sLogo = `/* generated by ${pakg.description} v${pakg.version} */\n`
/**
 * Default configuration for the console app
 */
const oSetup = {
    configName: 'tslite.json',
    configRoot: '',
    defaultConfig: {
        input: 'src-js',
        output: 'src-ts',
        matcher: ['/\\.js(x?)$/i', '.ts$1'],
        prefixes: {
            a: 'any[]',
            b: 'boolean',
            f: 'Function',
            n: 'number',
            o: 'any',
            s: 'string',
            '$e[0-9]*': 'any',
            '$[i-nx-z][0-9]*': 'number',
        }
    }
}
/**
 * Displays help and/or error information
 */
const help = (sMsg = '', sType = 'error') => {
    /// @ts-ignore
    const fShow = console[sType]
    if (sMsg && typeof fShow === 'function') [
        fShow(sMsg)
    ]
    console.info(`${pakg.description} v${pakg.version}
Usage:
tslite [<input> [<output>]] [-c <config>] [-r <root>] [--init] [-h|--help]
Options:
  <input>			Input file or directory to convert from JS to TS
  <output>			Optional output file or directory path
  -c <config>			JSON file to load configuration from - defaults to "tslite.json"
  -r <root>			JavaScript object (dotted) path to configuration inside JSON - defaults to ''
          			Example: -r "plugins.tslite"
  --init			Writes a "tslite.json" file with the default settings
  -h
  --help			Displays this information

Entries available in the JSON configuration:
  "input"			String or array of strings that are input file or directory paths
  "output"			String or array of strings that are output file or directory paths
  "matcher"			One pair array or an array of arrays of pairs with the first pair member
  				a string with wildcards or the string value of a RegExp and the second pair member
  				the output wildcard or replacement string. These strings match path endings.
  				E.g. ["/\\\\.js(x)?/i", ".ts$1"] or [["*.jsx", "*.tsx"], ["lib/*.js", "lib/*.ts"]]
  "prefixes"			An object with keys that are prefixes and values that are TypeScript type declarations.
  				A prefix is a sequence of lowercase English letters which starts an identifier name
  				omitting leftmost '_' or '$'. It is an exact match and may include regex special chars. 
  				If a prefix is preceded by '$', it matches the whole identifier name.
  				E.g. {"s": "string", "a": "any[]", "$[i-k]": "number"}

The following directives are recognized in any input file as block comments:
  /\* tslite-add: <content> *\/
  				Inserts the (multiline) <content> in place in the output file
  				E.g. /\* tslite-add: type Nullable = string | number | null */
  /\* tslite-remove: begin|end *\/
  				Removes the source code between begin and end block comments from the output
  				E.g. /\* tslite-remove: begin */ require('es6-poly'); /\* tslite-remove: end */
  /\* tslite-prefixes: ... *\/
  				A list of file specific prefixes in the form <key> = <value> separated by
  				semicolons and/or line breaks. They are applied over the project-wise prefixes
  				loaded e.g. from the JSON configuration.
  				E.g. /\* tslite-prefixes: req = Express.request; res = Express.response; fn = Function */
The ':' after a directive is optional. All directive blocks are removed from the output file.

Copyright (c) 2022 The Zonebuilder <zone.builder@gmx.com>
`)
}
/**
 * Process command line arguments
 */
const aArgs = process.argv.slice(2)
if (aArgs.indexOf('-h') > -1 || aArgs.indexOf('--help') > -1) {
    help()
    return
}
let x = aArgs.indexOf('--init')
if (x > -1) {
    try {
        fs.writeFileSync(oSetup.configName, JSON.stringify(oSetup.defaultConfig, null, '  '))
    }
    catch (e1) {
        console.error(e1.message)
    }
    return
}
x = aArgs.indexOf('-r')
if (x > -1) {
    if (aArgs.length < x  + 2 || aArgs[x + 1].substr(0, 1) === '-') {
        help('Root path not specified')
        return
    }
    oSetup.configRoot = aArgs[x + 1]
}
x = aArgs.indexOf('-c')
if (x > -1) {
    if (aArgs.length < x  + 2 || aArgs[x + 1].substr(0, 1) === '-') {
        help('Configuration file not specified')
        return
    }
    oSetup.configName = path.normalize(aArgs[x + 1])
}
let oConfig = null
if (x > -1 || fs.existsSync(oSetup.configName)) {
    let bIsDir = false
    try {
        bIsDir = fs.statSync(oSetup.configName).isDirectory()
    }
    catch (_e0) {}
    if (bIsDir) {
        console.error(`"${oSetup.configName}": the specified configuration is a directory`)
        return
    }
    try {
        oConfig = JSON.parse(fs.readFileSync(oSetup.configName, 'utf8'))
    }
    catch (e2) {
        let sError = e2.message
        if (sError.indexOf(': ') < 0) {
            sError = sError.substr(0, 1).toLowerCase() + sError.substr(1)
            sError = `"${oSetup.configName}": ` + sError
        }
        console.error(sError)
        return
    }
    if (oConfig && oSetup.configRoot) {
        const aSeg = oSetup.configRoot.split('.')
        while (aSeg.length) {
            const sItem = aSeg.shift()
            oConfig = oConfig[sItem]
            if (!oConfig) { break }
        }
    }
    if (!oConfig || typeof oConfig !== 'object') {
        console.error(`"${oSetup.configName}": the configuration at '${oSetup.configRoot}' is null or not an object`)
        return
    }
    if (oConfig && typeof oConfig.prefixes !== 'object') {
        console.error(`"${oSetup.configName}": the 'prefixes' property of the configuration must be either an object or null`)
        return
    }
}
oConfig = Object.assign({}, oSetup.defaultConfig, {
    input: '',
    output: '',
}, oConfig)
if (!oConfig.prefixes) { oConfig.prefixes = oSetup.defaultConfig.prefixes }
if (aArgs.length && aArgs[0].substr(0, 1) !== '-') {
    oConfig.input = aArgs[0]
}
if (!oConfig.input || (typeof oConfig.input === 'string' && !oConfig.input.trim())) {
    help(`No input file or directory specified, or found in "${oSetup.configName}"`)
    return
}
oConfig.input = [].concat(oConfig.input).map(sItem => sItem.toString().trim())
if (aArgs.length > 1 && aArgs[1].substr(0, 1) !== '-') {
    oConfig.output = aArgs[1]
}
oConfig.output = [].concat(oConfig.output).map(sItem => sItem.toString().trim())
if (oConfig.matcher.length > 1 && typeof oConfig.matcher[1] !== 'object') { oConfig.matcher = [oConfig.matcher] }
oConfig.matcher.forEach(aItem => {
    aItem[1] = aItem[1].toString()
    if (aItem[0] instanceof RegExp) { return }
    aItem[0] = aItem[0].toString()
    if (aItem[0].substr(0, 1) === '/') {
        const aParts = aItem[0].split('/')
        const sMod = aParts.pop()
        aItem[0] = new RegExp(aParts.slice(1).join('/'), sMod)
    }
    else {
        const sExpr = path.normalize(aItem[0]).replace(/(\W)/g,'\\$1').replace(/\\(\s)/g, '\\s+')
            .replace(/\\\*/g, '([\\s\\S]*)').replace(/\\\?/g, '([\\s\\S])')
        aItem[0] = new RegExp(sExpr + '$', 'i')
        let n = 0
        aItem[1] = aItem[1].replace(/[\*\?]/g, () => `$${++n}`)
    }
})
// Pre-compile regexs for the comment block directives
const oCommPrefixRe = /\/\*\*?\s*tslite-prefixes\b:?([\s\S]*?)\*\/(\s*?\n)?/g
const oCommTscRe = /\/\*\*?\s*tslite-add\b:?([\s\S]*?)\*\/(\s*?\n)?/g
const oCommRemRe = /\/\*\s*tslite-remove\b:\s*begin\s*\*\/[\s\S]*?\/\*\s*tslite-remove\b:?\s*end\s*\*\/(\s*?\n)?/g
const oStripRe = /^\s*(\*|\/\/|\|)\x20?/
/**
 * Parse TSLite’s comment block directives
 */
const convert = (sData, oPrefixes) => {
    let oDataPrefixes = null
    sData = sData.replace(oCommRemRe, (sMatch, sCap) => {
        if (sCap && sMatch.lastIndexOf('\n') > -1) { sCap = '' }
        return sCap || ''
    })
    sData = sData.replace(oCommPrefixRe, (_s, sCap, sCap2) => {
        for (const sLine of sCap.split('\n')) {
            for (const sItem of sLine.replace(oStripRe, '').split(';')) {
                const aParts = sItem.split('=')
                if (aParts.length > 1) {
                    const sKey = aParts.shift().trim()
                    const sVal = aParts.join('=').trim()
                    if (sKey && sVal) {
                        oDataPrefixes = oDataPrefixes || {}	
                        oPrefixes[sKey] = sVal
                    }
                }
            }
        }
        if (sCap2 && sCap.lastIndexOf('\n') > -1) { sCap2 = '' }
        return sCap2 || ''
    })
    sData = tslite(sData, [oPrefixes, oDataPrefixes])
    sData = sData.replace(oCommTscRe, (_s, sCap, sCap2) => {
        const aLines = sCap.split('\n').map(s => s.replace(oStripRe, ''))
        if (aLines[0].substr(0, 1) === ' ') { aLines[0] = aLines[0].substr(1) }
        if (aLines[0].substr(-1) === ' ') { aLines[0] = aLines[0].slice(0, -1) }
        const n = aLines.length
        if (!aLines[n - 1].trim()) {
            if (sCap2) { sCap2 = '\n' }
            aLines.pop()
        }
        if (aLines.length && !aLines[0].trim()) { aLines.shift() }
        return aLines.join('\n') + (sCap2 || '')
    })
    return sData
}
const oDotRe = /^\.+$/
/**
 * Creates a directory path recursively
 */
const mkdir = (sPath, bIsNorm) => {
    if (!bIsNorm) { sPath = path.normalize(sPath) }
    if (oDotRe.test(sPath)) { return }
    let oStat = null
    try {
        oStat = fs.statSync(sPath)
    }
    catch (_e) {}
    if (oStat && oStat.isDirectory()) { return }
    mkdir(path.dirname(sPath), true)
    fs.mkdirSync(sPath, 0o755)
}
// // Main processing loop
oConfig.input.forEach((sItem, nIx) => {
    if (!sItem) { return }
    try {
        sItem = fs.realpathSync(sItem)
    }
    catch (e11) {
        console.error(e11.message)
        return
    }
    let bIsDirSrc = false
    try {
        bIsDirSrc = fs.statSync(sItem).isDirectory()
    }
    catch (e12) {
        console.error(e12.message)
        return
    }
    const sOut = path.normalize(oConfig.output[nIx])
    let bIsDirDest = bIsDirSrc || oDotRe.test(sOut)
    try {
        bIsDirDest = bIsDirDest || fs.statSync(sOut).isDirectory()
    }
    catch (_e13) {}
    let aParse = [[]]
    aParse[0].push(bIsDirSrc ? [sItem, ''] : [path.dirname(sItem), path.basename(sItem)])
    aParse[0].push(bIsDirDest ? [sOut, ''] : [path.dirname(sOut), path.basename(sOut)])
    let oDirMap = {}
    while (aParse.length) {
        const [aSrc, aDest] = aParse.shift()
        if (aSrc[1]) {
            const sFrom = path.join(...aSrc)
            let sData = ''
            try {
                sData = fs.readFileSync(sFrom, 'utf8')
            }
            catch (e21) {
                console.error(e21.message)
                continue
            }
            sData = convert(sData, oConfig.prefixes)
            let sTo = ''
            if (aDest[1]) {
                sTo = path.join(...aDest)
            }
            else {
                sTo = path.join(aDest[0], aSrc[1])
                for (const [oExpr, sRepl] of oConfig.matcher) {
                    if (oExpr.test(sTo)) {
                        sTo = sTo.replace(oExpr, sRepl)
                        break
                    }
                }
            }
            const sDir = aDest[1] ? aDest[0] : path.dirname(sTo)
            let sToDir = oDirMap[sDir]
            if (!sToDir) {
                try {
                    mkdir(sDir, true)
                    sToDir = oDirMap[sDir] = fs.realpathSync(sDir)
                }
                catch (e22) {
                    console.error(e22.message)
                    return
                }
            }
            sTo = path.join(sToDir, aDest[1] || path.basename(sTo))
            if (sFrom === sTo) { sTo += '.ts' }
            try {
                fs.writeFileSync(sTo, sLogo + sData)
            }
            catch (e23) {
                console.error(e23.message)
                continue
            }
        }
        else {
            let aEntries = []
            try {
                aEntries = fs.readdirSync(aSrc[0])
            }
            catch (e31) {
                console.error(e31.message)
                continue
            }
            if (!aEntries.length) { continue }
            const aGroups = []
            for (let j = 0; j < oConfig.matcher.length + 1; j++) { aGroups.push([]) }
            for (const sEntry of aEntries) {
                if (oDotRe.test(sEntry)) { continue }
                const sFrom = path.join(aSrc[0], sEntry)
                let z = -1
                for (let i = 0; i < oConfig.matcher.length; i++) {
                    if (oConfig.matcher[i][0].test(sFrom)) {
                        z = i
                        break
                    }
                }
                let bIsDir = false
                try {
                    bIsDir = fs.statSync(sFrom).isDirectory()
                }
                catch (e32) {
                    if (z > -1) { console.error(e32.message) }
                    continue
                }
                if (bIsDir) {
                    z = oConfig.matcher.length
                    aGroups[z].push([
                        [sFrom, ''],
                        [path.join(aDest[0], sEntry), ''],
                    ])
                }
                else {
                    if (z < 0) { continue }
                    aGroups[z].push([
                        [aSrc[0], sEntry],
                        [aDest[0], ''],
                    ])
                }
            }
            if (oDotRe.test(oConfig.input[nIx])) { aGroups.pop() }
            aParse = aParse.concat(...aGroups)
			
        }
    }
})	

/* tslite-add: })() */

