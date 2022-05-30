/*
	TSLite - converts your valid JavaScript to TypeScript v0.5.0
	Copyright (c) 2022 The Zonebuilder <zone.builder@gmx.com>
	https://github.com/zonebuilder/tslite-node
	License: MIT
*/
'use strict'
/* tslite-prefixes
 * 	o = enumerable
 * 	f = callback
 */
/* tslite-add	
 * type enumerable = {[key: string]: any}
 * type callback = (...args: any[]) => any
 */ 
// Create a heterogeneous array of items
const aItems = []
aItems.push({a: true, b: true})
aItems.push({ca: true, d: true, e: true})
// // Alter the items in an atypical way
aItems.forEach(oItem => {
    oItem.len = Object.keys(oItem).length
})
// Test the second kind of looping
for (const o of aItems) {
    for (const s in o) {
        if (s === 'len') { o[s]++ }
    }
}
// Test third kind of looping
let j
for (j = aItems.length; j--;) {
    aItems[j ].len--
}	
// Test arrow function parameter list
const prn = (sMsg, fCall) => {
    fCall(sMsg)
}
let a2
a2 = aItems.slice(0)
// Test exception catch argument
try {
    prn('=====================================', console.info)
    console.info(a2)
}
catch (e1) {
    console.error(e1.message)
}
