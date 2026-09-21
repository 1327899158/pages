import fs from 'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
import {load} from 'cheerio';
import {sources} from '../lib/sources.ts';
const root=new URL('../../ai-radar/',import.meta.url);
const dir=new URL('translations/',root);await fs.mkdir(dir,{recursive:true});
const titles=[];
for(const source of sources.filter(s=>s.adapter)){
 try{const feed=JSON.parse(await fs.readFile(new URL('feeds/'+source.id+'.json',root),'utf8'));for(const i of feed.items||[])if(/[a-zA-Z]{3}/.test(i.title)&&!/[\u3400-\u9fff]/.test(i.title))titles.push(i.title)}catch{}
}
const unique=[...new Set(titles)];
const env=process.env;
async function post(url,headers,body){
 const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Translation request failed');return r.json();
}
const providers={
 google:{configured:!!env.GOOGLE_TRANSLATE_API_KEY,async translate(text){
  const j=await post('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(env.GOOGLE_TRANSLATE_API_KEY),{}, {q:text,source:'en',target:'zh-CN',format:'text'});
  return j.data.translations.map(t=>load(t.translatedText).text());
 }},
 deepl:{configured:!!env.DEEPL_API_KEY,async translate(text){
  const host=env.DEEPL_API_KEY.endsWith(':fx')?'api-free.deepl.com':'api.deepl.com';
  const j=await post('https://'+host+'/v2/translate',{Authorization:'DeepL-Auth-Key '+env.DEEPL_API_KEY},{text,source_lang:'EN',target_lang:'ZH'});
  return j.translations.map(t=>t.text);
 }},
 tencent:{configured:!!(env.TENCENT_SECRET_ID&&env.TENCENT_SECRET_KEY),async translate(text){
  const body={Source:'en',Target:'zh',ProjectId:0,SourceTextList:text},host='tmt.tencentcloudapi.com';
  const timestamp=Math.floor(Date.now()/1000),date=new Date(timestamp*1000).toISOString().slice(0,10),scope=date+'/tmt/tc3_request';
  const hash=s=>createHash('sha256').update(s).digest('hex');
  const hmac=(key,s)=>createHmac('sha256',key).update(s).digest();
  const canonical='POST\n/\n\ncontent-type:application/json\nhost:'+host+'\n\ncontent-type;host\n'+hash(JSON.stringify(body));
  const signingKey=hmac(hmac(hmac('TC3'+env.TENCENT_SECRET_KEY,date),'tmt'),'tc3_request');
  const signature=createHmac('sha256',signingKey).update('TC3-HMAC-SHA256\n'+timestamp+'\n'+scope+'\n'+hash(canonical)).digest('hex');
  const j=await post('https://'+host,{'X-TC-Action':'TextTranslateBatch','X-TC-Version':'2018-03-21','X-TC-Region':'ap-guangzhou','X-TC-Timestamp':String(timestamp),Authorization:'TC3-HMAC-SHA256 Credential='+env.TENCENT_SECRET_ID+'/'+scope+', SignedHeaders=content-type;host, Signature='+signature},body);
  if(j.Response?.Error)throw Error('Tencent translation failed');return j.Response.TargetTextList;
 }}
};
for(const [id,provider] of Object.entries(providers)){
 const file=new URL(id+'.json',dir);let old={};
 try{old=JSON.parse(await fs.readFile(file,'utf8')).translations||{}}catch{}
 const translations={...old};let status=provider.configured?'ready':'unconfigured',used=0;
 if(provider.configured){
  const pending=unique.filter(t=>!translations[t]);
  // Bound each provider to 10,000 new source characters per run; successful titles are reused.
  while(pending.length&&used<10000){
   const batch=[];let size=0;
   while(pending.length&&batch.length<20&&size+pending[0].length<2000&&used+size+pending[0].length<=10000){const t=pending.shift();batch.push(t);size+=t.length;}
   if(!batch.length)break;
   used+=size;
   try{const result=await provider.translate(batch);if(!Array.isArray(result)||result.length!==batch.length||result.some(v=>typeof v!=='string'||!v.trim()||v.length>1000))throw Error('Invalid result');batch.forEach((t,i)=>translations[t]=result[i]);}
   catch{status='error';break;}
  }
 }
 const missing=unique.filter(t=>!translations[t]).length;
 await fs.writeFile(file,JSON.stringify({provider:id,status,updatedAt:new Date().toISOString(),missing,translations}));
 console.log(id,status,'cached',Object.keys(translations).length,'missing',missing);
}
