import {useEffect,useState} from 'react';

const CACHE='radar-title-translations-v1';
const BUDGET='radar-translation-budget-v1';
export const translationProviders=[{id:'mymemory',name:'MyMemory 免费'},{id:'google',name:'Google'},{id:'deepl',name:'DeepL'},{id:'tencent',name:'腾讯云'}];
type Snapshot={status:string;translations:Record<string,string>;missing?:number};
export const isEnglishTitle=(s:string)=>/[a-zA-Z]{3}/.test(s)&&!/[\u3400-\u9fff]/.test(s);
export function useTitleTranslation(titles:string[]){
 const [provider,setProvider]=useState('mymemory'),[snapshots,setSnapshots]=useState<Record<string,Snapshot>>({});
 const [enabled,setEnabled]=useState(false),[cache,setCache]=useState<Record<string,string>>({}),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[retry,setRetry]=useState(0);
 const key=JSON.stringify([...new Set(titles.filter(isEnglishTitle))]);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(CACHE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))setCache(Object.fromEntries(Object.entries(saved).filter(([k,v])=>k.length<=240&&typeof v==='string'&&v.length<=1000)) as Record<string,string>)}catch{}setReady(true)},[]);
 useEffect(()=>{
  if(!enabled||!ready||provider!=='mymemory')return;
  const controller=new AbortController();let stopped=false;
  async function run(){
   const queue=(JSON.parse(key) as string[]).filter(t=>!cache[t]);
   setBusy(queue.length>0);setMessage('');
   const updated={...cache};let failed=0;
   for(const title of queue){
    if(stopped)break;
    const today=new Date().toISOString().slice(0,10);let usage={date:today,chars:0};
    try{const old=JSON.parse(localStorage.getItem(BUDGET)||'null');if(old?.date===today&&Number.isFinite(old.chars))usage=old}catch{}
    if(usage.chars+title.length>4500){setMessage('今日免费翻译额度已用完，未翻译标题保留原文。明天可继续。');break;}
    if(new TextEncoder().encode(title).length>500)continue;
    usage.chars+=title.length;try{localStorage.setItem(BUDGET,JSON.stringify(usage))}catch{}
    try{
     const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',title);url.searchParams.set('langpair','en|zh-CN');
     const timeout=setTimeout(()=>controller.abort(),20000);
     let data;
     try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('网络异常');data=await response.json()}finally{clearTimeout(timeout)}
     if(stopped)break;
     if(data.quotaFinished||Number(data.responseStatus)===429){setMessage('翻译服务额度暂时用完，未翻译标题保留原文。');break;}
     if(Number(data.responseStatus)!==200||typeof data.responseData?.translatedText!=='string')throw Error('无可用译文');
     const translated=new DOMParser().parseFromString(data.responseData.translatedText,'text/html').documentElement.textContent?.trim();
     if(!translated||translated.length>1000||!/[\u3400-\u9fff]/.test(translated))throw Error('无可用中文译文');
     updated[title]=translated;setCache({...updated});
     try{localStorage.setItem(CACHE,JSON.stringify(Object.fromEntries(Object.entries(updated).slice(-2000))))}catch{}
    }catch{if(stopped)break;failed++;setMessage('部分标题暂时无法翻译，已保留原文，可点击重试。');if(failed>=3||controller.signal.aborted)break;}
   }
   if(!stopped)setBusy(false);
  }
  void run();return()=>{stopped=true;controller.abort()};
 },[enabled,ready,key,retry,provider]);
 useEffect(()=>{
  const controller=new AbortController();
  for(const id of ['google','deepl','tencent'])void fetch(import.meta.env.BASE_URL+'translations/'+id+'.json?t='+Date.now(),{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();const s=await r.json();if(!['ready','unconfigured','error'].includes(s.status)||!s.translations||typeof s.translations!=='object')throw Error();const translations=Object.fromEntries(Object.entries(s.translations).filter(([k,v])=>k.length<=240&&typeof v==='string'&&v.length<=1000)) as Record<string,string>;setSnapshots(p=>({...p,[id]:{...s,translations}}))}).catch(()=>{if(!controller.signal.aborted)setSnapshots(p=>({...p,[id]:{status:'unavailable',translations:{}}}))});
  return()=>controller.abort();
 },[retry]);
 const snapshot=snapshots[provider],active=provider==='mymemory'?cache:snapshot?.translations||{};
 const paidMessage=!snapshot?'正在读取服务状态…':snapshot.status==='unconfigured'?'此服务尚未配置，请站点所有者配置后使用；当前保留原文。':snapshot.status==='unavailable'?'服务状态读取失败，请重试。':snapshot.status==='error'?'上次翻译任务失败，已有译文仍可查看，其余保留原文。':titles.some(t=>isEnglishTitle(t)&&!active[t])?'部分标题尚未生成此服务的译文，暂时保留原文。':'';
 return {provider,providers:translationProviders,choose:(id:string)=>{setProvider(id);setEnabled(true)},providerStatus:(id:string)=>id==='mymemory'?'':!snapshots[id]?'读取中':snapshots[id].status==='unconfigured'?'未配置':snapshots[id].status==='ready'?'已配置':'暂不可用',enabled,toggle:()=>setEnabled(v=>!v),busy:enabled&&(provider==='mymemory'?busy:!snapshot),message:enabled?(provider==='mymemory'?message:paidMessage):'',retry:()=>setRetry(v=>v+1),title:(s:string)=>enabled&&active[s]?active[s]:s,translated:(s:string)=>enabled&&!!active[s]};
}
