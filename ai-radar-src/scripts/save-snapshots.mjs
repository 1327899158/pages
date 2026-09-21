import {execFileSync,spawnSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const base=git('rev-parse','HEAD');
const output=value=>{if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`publish=${value}\n`);console.log(`publish=${value}`)};
const current=()=>{git('fetch','origin','main');return git('rev-parse','origin/main')===base};
const skip=()=>{console.log('::notice::Main advanced during collection; skip this obsolete snapshot and deployment. The newer push or next scheduled run will publish.');output(false)};
if(!current())skip();
else {
 git('add','ai-radar');
 if(git('diff','--cached','--name-only')){
  git('commit','-m','Update AI Radar snapshots');
  const result=spawnSync('git',['push','origin','HEAD:main'],{stdio:'inherit'});
  if(result.status===0)output(true);
  else if(!current())skip();
  else throw Error('Snapshot push failed without a newer remote commit. Check repository write permissions or network.');
 }else output(true);
}
