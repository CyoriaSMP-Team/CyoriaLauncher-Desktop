// Checks language files remain aligned and interpolation variables are not lost.
const fs=require('fs');
const src=Object.fromEntries(['en','th','vi'].map(code=>[code,JSON.parse(fs.readFileSync(`public/locales/${code}.json`,'utf8'))]));
function flatten(value,path='',out={}) { if(Array.isArray(value))value.forEach((v,i)=>flatten(v,`${path}[${i}]`,out));else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>flatten(v,path?`${path}.${k}`:k,out));else out[path]=value;return out }
const dict=Object.fromEntries(Object.entries(src).map(([l,data])=>[l,flatten(data)]));const base=dict.en,errors=[];
for(const lang of ['th','vi']) {const other=dict[lang];for(const [k,v] of Object.entries(base)){if(!(k in other))errors.push(`${lang}: missing ${k}`);else if(typeof v!==typeof other[k])errors.push(`${lang}: wrong type ${k}`);else if(typeof v==='string'){let vars=t=>[...t.matchAll(/\{\{(\w+)\}\}/g)].map(x=>x[1]).sort().join(',');if(vars(v)!==vars(other[k]))errors.push(`${lang}: placeholder mismatch ${k}`)}}for(const k of Object.keys(other))if(!(k in base))errors.push(`${lang}: extra ${k}`)}
if(errors.length){console.error(errors.slice(0,30).join('\n'));process.exit(1)}
console.log(`Locale OK: ${Object.keys(base).length} aligned entries (en, th, vi)`)
