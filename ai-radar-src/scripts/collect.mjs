import fs from 'node:fs/promises';
import {sources} from '../lib/sources.ts';
import {getFeed} from '../lib/collect.ts';
const dir=new URL('../../ai-radar/feeds/',import.meta.url);
await fs.mkdir(dir,{recursive:true});
const queue=sources.filter(s=>s.adapter);let index=0,ok=0,stale=0;
await Promise.all(Array.from({length:5},async()=>{
 while(index<queue.length){
  const source=queue[index++],file=new URL(source.id+'.json',dir);
  let feed=await getFeed(source.id);
  if(feed.status==='ok')ok++;
  else {try{const old=JSON.parse(await fs.readFile(file,'utf8'));if(old.items?.length){feed={...old,status:'stale',message:'本轮采集失败，显示上次成功内容'};stale++;}}catch{}}
  await fs.writeFile(file,JSON.stringify(feed));
  console.log(source.id,feed.status,feed.items.length);
 }
}));
await fs.writeFile(new URL('status.json',dir),JSON.stringify({updatedAt:new Date().toISOString(),sources:queue.length,ok,stale}));
console.log({ok,stale,total:queue.length});
if(!ok)process.exitCode=1;
