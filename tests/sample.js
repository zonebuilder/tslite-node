'use strict'
/* tslite-prefixes
 * 	o = enumerable
 * 	f = callback
 */
/* tslite-add	
 * type enumerable = {[key: string]: any}
 * type callback = (...args: any[]) => any
 */ 
const aItems = []
aItems.push({a: true, b: true})
aItems.push({ca: true, d: true, e: true})
aItems.forEach(oItem => {
    oItem.len = Object.keys(oItem).length
})
for (const o of aItems) {
    for (const s in o) {
        if (s === 'len') { o[s]++ }
    }
}
let j
for (j = aItems.length; j--;) {
    aItems[j ].len--
}	
const prn = (sMsg, fCall) => {
    fCall(sMsg)
}
let a2
a2 = aItems.slice(0)
try {
    prn('=====================================', console.info)
    console.info(a2)
}
catch (e1) {
    console.error(e1.message)
}
