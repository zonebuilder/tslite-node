/* tslite-remove: begin */
/*eslint no-unused-vars: ["error", {"args": "none"}]*/
/*eslint no-prototype-builtins: "off"*/
/*eslint no-useless-escape: "off"*/
/* tslite-remove: end */
'use strict'
/* tslite-prefixes
 * 	o = enumerable
 * 	f = callback
 */
/* tslite-add	
 * type enumerable = {[key: string]: any}
 * type callback = (...args: any[]) => any
 */ 
const oPrefixes = {
    a: 'any[]',
    b: 'boolean',
    f: 'Function',
    n: 'number',
    o: 'any',
    s: 'string',
}

const oExps = {
    vn: '[A-Za-z_$][Mw$]*',
    vn1: '({vn})',
    rn: '(M.{3}Ms*)?{vn}',
    nl: '[M[M{]?Ms*{rn}(Ms*[,:]Ms*{rn})*Ms*[M]M}]?',
    simple: '^Ms*{rn}Ms*$',
    params: 'Ms*{nl}(Ms*,Ms*{nl})*Ms*,?Ms*',
    arrow1: '{vn}Ms*=>',
    arrow2: 'M({params}M)Ms*=>',
    arrow1b: '{arrow1}$',
    func1: 'MbfunctionMbMs*({vn})?Ms*M({params}(=|M))',
    func2: '{vn}Ms*M({params}M)Ms*M{',
    bi: 'Mb(if|for|switch|while)Ms*M(',
    except: '^{bi}',
    decl: '({bi}Ms*)?Mb(const|let|var)MbMs*{nl}(Ms*=)?',
    vars: '({arrow1})|({decl})|({arrow2})|({func2})|({func1})',
    prefix: '^[_$]*([a-z]+)',
    onechar: '^[_$]*[a-z]Md*$',
    get(sItem) {
        const sKey = '_' + sItem
        return this[sKey] || (this[sKey] = this[sItem].replace(/M/g, '\\')
            .replace(/\{([a-z]\w*)\}/gi, (sCh, sCp) => {
                if (sCp in this && sCp !== sItem) { return this.get(sCp) }
                else { return sCh }
            })
        ) /* tslite-add: as string */
    },
    up() {
        const fTag = sTag => new RegExp(`(\\{${sTag}\\})`, 'g')
        Object.assign(this, {
            rni: this.rn.replace(fTag('vn'), '$1(Ms*=Ms*(M[Ms*M]|M{Ms*M}|[^MrMn;,M(M)M[M]M{M}]*))?'),
            nli: this.nl.replace(fTag('rn'), '{rni}'),
            paramsi: this.params.replace(fTag('nl'), '{nli}'),
            arrow2: this.arrow2.replace(fTag('params'), '{paramsi}'),
            func1: this.func1.replace(fTag('params'), '{paramsi}'),
            func2: this.func2.replace(fTag('params'), '{paramsi}'),
            decl: this.decl.replace(fTag('nl'), '{nli}'),
        })		
    }	
}
oExps.up()

const oRe = Object.fromEntries(Object.entries(oExps)
    .filter(([_sKey, oVal]) => typeof oVal === 'string').map(([sKey, sExp]) => {
        return [sKey, new RegExp(oExps.get(sKey), sExp.substr(0, 1) === '^' || sExp.substr(-1) === '$' ? '' : 'g')]
    }))

const otherTyper = (sPrefix, sName) => {
    if (sPrefix.length === 1 && oRe.onechar.test(sName)) {
        if (sPrefix === 'e') { return 'any' }
        else if (sPrefix >= 'i' && sPrefix <= 'm') { return 'nNumber' }
        else if (sPrefix >= 'x' && sPrefix <= 'z') { return 'nNumber' }
    }
    return ''
}

const suffixer = (sName, oPrefixMap, fOther) => {
    if (oRe.prefix.test(sName)) {
        let sType = ''
        sName.replace(oRe.prefix, (sMatch, sPrefix) => {
            if (oPrefixMap.hasOwnProperty(sPrefix)) {
                sType = oPrefixMap[sPrefix]
            }
            else if (fOther) {
                sType = fOther(sPrefix, sName) || ''
            }
            return sMatch
        })
        return sName + (sType ? ': ' + sType : '')
    }
    else {
        return sName
    }
}

const hinter = (sData, oPrefixMap, fOther) => {
    if (typeof fOther !== 'function') { fOther = null }
    if (oPrefixMap && typeof oPrefixMap === 'object') {	
        oPrefixMap = Object.assign({}, ...[].concat(oPrefixMap))
        if (!fOther && !Object.keys(oPrefixMap).length) { return sData }
    }
    if (!oPrefixMap || typeof oPrefixMap !== 'object') {
        oPrefixMap = oPrefixes
        fOther = otherTyper
    }
    else if (!fOther) {
        const oReStatic = /^\w+$/
        const aPrefixRe = []
        const oNameCache = {}
        Object.keys(oPrefixMap).forEach(sKey => {
            if (!oReStatic.test(sKey)) {
                const bIsName = sKey.substr(0, 1) === '$'
                const sExpr = bIsName ? sKey.substr(1) : sKey
                aPrefixRe.push([new RegExp('^' + sExpr + '$'), oPrefixMap[sKey], bIsName])
                delete oPrefixMap[sKey]
            }
        })
        if (aPrefixRe.length) {
            fOther = (sPrefix, sName) => {
                if (oNameCache.hasOwnProperty(sName)) { return oNameCache[sName] }
                for (const [oRe, sType, bVar] of aPrefixRe) {
                    if (bVar) {
                        if (oRe.test(sName)) {
                            oNameCache[sName] = sType
                            return sType
                        }
                    }
                    else {
                        if (oRe.test(sPrefix)) {
                            oPrefixMap[sPrefix] = sType
                            return sType
                        }
                    }
                }
                oNameCache[sName] = ''
                return ''
            }
        }
    }
    const fPostfix = sName => suffixer(sName, oPrefixMap, fOther)
    const oExcept = {left: [], right: []}
    let c = '', ca = ''
    let sComment = '', sString = '', sLast = ''
    let bInComment = false, bInString = false, bInRegex = false, bEscape = false
    const oReSpace = /^\s/, oReLast = /(\)|[\w_$]|\+{2}|\-{2})$/
    for (let i = 0; i < sData.length; i++) {
        c = sData.substr(i, 1)
        if (bInComment) {
            if ((c === '/' && ca === '*' && sComment === '*') || (c === '\n' && sComment === '/')) {
                bInComment = false
                sComment = ''
                oExcept.right.push(i)
            }
        }
        else if (bInString) {
            if (!bEscape && c === sString) {
                bInString = false
                sString = ''
                oExcept.right.push(i)
            }
        }
        else if (bInRegex) {
            if (!bEscape && (c === '/' || c === '\n')) {
                bInRegex = false
                oExcept.right.push(i)
            }
        }
        else {
            switch (c) {
            case '/':
                if (!bEscape && ca !== '/' && !oReLast.test(sLast)) {
                    bInRegex = true
                    oExcept.left.push(i)
                }
                // falls ?through
                if (ca === '/') {
                    bInComment = true
                    sComment = c
                    oExcept.left.push(i)
                }
                break
            case '\'':
            case '"':
            case '`':
                bInString = true
                sString = c
                oExcept.left.push(i)
                break
            }
        }
        if (c === '\n') { sLast = '' }
        else if (!oReSpace.test(c)) { sLast = ca + c }
        if (c === '\\') {
            if (ca === '\\') { bEscape = !bEscape }
            else { bEscape = true }
        }  
        else {
            bEscape = false
        }
        ca = c
    }
	
    const fInside = (nFrom, nLeft = 0, nRight = oExcept.right.length - 1) => {
        if (nRight < nLeft) { return false }
        if (!nLeft && nFrom < oExcept.left[nLeft]) { return false }
        if (nRight === oExcept.left.length - 1 && oExcept.left[nRight] <= nFrom) { return nFrom <= oExcept.right[nRight] }
        if (nRight - nLeft < 2) { return nFrom <= oExcept.right[nLeft] }
        const nMid = (nLeft + nRight) >> 1
        if (nFrom < oExcept.left[nMid]) { return fInside(nFrom, nLeft, nMid) }
        else { return fInside(nFrom, nMid, nRight) }
    }

    return sData.replace(oRe.vars, function(sMatch) {
        if (oRe.except.test(sMatch)) { return sMatch }
        const nFrom = arguments[arguments.length - 2]
        if (fInside(nFrom)) { return sMatch }
        let sLeft = '', sMain = '', sRight = ''
        let bEnclose = false
        let aParts = sMatch.split('(')
        if (aParts.length > 1) {
            sMain = aParts[1]
            sLeft = aParts[0] + '('
            aParts = sMain.split(')')
            if (aParts.length > 1) {
                sMain = aParts[0]
                sRight = ')' + aParts[1]
            }
        }
        else {
            aParts = sMatch.split('=>')
            if (aParts.length === 2 && !aParts[1]) {
                bEnclose = true
                sMain = aParts[0]
                sRight = '=>'
            }
            else {
                const nSplit = sMatch.substr(0, 1) === 'c' ? 5 : 3
                sMain = sMatch.substr(nSplit)
                sLeft = sMatch.slice(0, nSplit)
            }
        }
        let nSquare = 0
        let  nCurly = 0
        sMain = sMain.split(',').map(sItem => {
            for (let i = 0; i < sItem.length; i++) {
                switch (sItem.substr(i, 1)) {
                case '[': nSquare++; break
                case ']': nSquare--; break
                case '{': nCurly++; break
                case '}': nCurly--; break
                }
            }
            const aParts = sItem.split('=')
            if (aParts.length > 2 && aParts[2].substr(0, 1) === '>' && oRe.arrow1b.test(aParts[1] + '=>')) {
                aParts[1] = aParts[1].replace(oRe.vn1, '($1)').replace(oRe.vn, fPostfix)
            }
            const sFirst = aParts[0]
            if (!nSquare && !nCurly  && oRe.simple.test(sFirst)) {
                aParts[0]  = (bEnclose ? sFirst.replace(oRe.vn1, '($1)') : sFirst).replace(oRe.vn, fPostfix)
            }
            return aParts.join('=')
        }).join(',')
        return sLeft + sMain + sRight
    })
}

module.exports = hinter
