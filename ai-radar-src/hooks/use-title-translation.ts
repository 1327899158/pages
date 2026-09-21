import {useEffect,useState} from 'react';

const CACHE='radar-title-translations-v1';
const BUDGET='radar-translation-budget-v1';
export const isEnglishTitle=(s:string)=>/[a-zA-Z]{3}/.test(s)&&!/[\u3400-\u9fff]/.test(s);
export function useTitleTranslation(titles:string[]){
 const [enabled,setEnabled]=useState(false),[cache,setCache]=useState<Record<string,string>>({}),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[retry,setRetry]=useState(0);
 const key=JSON.stringify([...new Set(titles.filter(isEnglishTitle))]);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(CACHE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))setCache(Object.fromEntries(Object.entries(saved).filter(([k,v])=>k.length<=240&&typeof v==='string'&&v.length<=1000)) as Record<string,string>)}catch{}setReady(true)},[]);
 useEffect(()=>{
  if(!enabled||!ready)return;
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
 },[enabled,ready,key,retry]);
 return {enabled,toggle:()=>setEnabled(v=>!v),busy:enabled&&busy,message:enabled?message:'',retry:()=>setRetry(v=>v+1),title:(s:string)=>enabled&&cache[s]?cache[s]:s,translated:(s:string)=>enabled&&!!cache[s]};
}
