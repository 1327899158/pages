'use strict';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sites = {qshp:'清水河畔',byr:'北邮人论坛'};
let endpoint = sessionStorage.getItem('forum-endpoint') || '', key = sessionStorage.getItem('forum-key') || '';
let view = 'posts', page = 1, version = 0, readerVersion = 0, rows = [], pages = 1;
function endpointURL(raw) {
  const u = new URL(raw.trim());
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/') throw Error('请输入 HTTPS 接口域名，不带路径或密钥');
  return u.origin;
}
async function api(path) {
  const response = await fetch(endpoint + path, {headers:{Authorization:'Bearer ' + key}, credentials:'omit', redirect:'error', cache:'no-store', signal:AbortSignal.timeout(20000)});
  if (response.status === 401) {sessionStorage.removeItem('forum-key');showSettings();throw Error('密钥不正确或已更换，请重新连接');}
  const result = await response.json();
  if (!response.ok) throw Error(result.error || '读取失败，请稍后重试');
  return result;
}
function showSettings() { $('endpoint').value = endpoint; $('key').value = ''; if (!$('connect').open) $('connect').showModal(); }
function errorText(e) { return e instanceof TypeError || e.name === 'TimeoutError' ? '无法连接电脑。请检查电脑是否开机、隧道是否运行，以及接口地址和允许的网页来源是否正确。' : e.message; }
async function load() {
  if (!endpoint || !key) return showSettings();
  const current = ++version;
  $('pagination').hidden = true;
  $('results').innerHTML = '<div class="empty">正在读取…</div>';
  const q = $('query').value.trim(), params = new URLSearchParams({site:$('site').value});
  let route = view === 'views' ? '/api/view-growth' : '/api/hot';
  if (view === 'posts') {
    route = q ? '/api/search' : '/api/threads';
    if (q) params.set('q', q);
    else {params.set('page', page);params.set('category', $('category').value);}
  }
  try {
    const data = await api(route + '?' + params);
    if (current !== version) return;
    rows = data.results;pages = data.pages || 1;
    $('summary').textContent = view === 'views' ? '全版块 Top 10 · '+data.coverage : view === 'hot' ? '仅限北京时间今天发布的帖子 · 按互动增长排序' : q ? `找到 ${rows.length} 条匹配${data.mode === 'bounded_substring' ? ' · 短词在最近 5,000 条内容内查找' : ''}` : `共 ${data.total} 个帖子`;
    $('connection').textContent = '已连接电脑 · 更新于 ' + new Date().toLocaleTimeString('zh-CN');
    $('results').innerHTML = rows.length ? rows.map((r,i) => `<article class="post"><button class="title" data-row="${i}">${view !== 'posts' ? (i+1)+'. ' : ''}${esc(r.title)}</button><div class="meta">${esc(sites[r.platform])} · ${esc(r.board_id)}${r.field ? ' · '+esc({title:'标题命中',main:'正文命中',reply:'评论命中'}[r.field] || r.field) : ''}${r.classification?.category ? ' · '+esc(r.classification.category) : ''}${view === 'hot' ? ' · 热度 '+esc(r.hotness_score ?? '积累中') : ''}</div>${view === 'views' ? `<p class="snippet"><strong>${r.views_per_minute.toFixed(1)} 浏览/分钟</strong> · ${r.interval_seconds} 秒新增 ${r.delta} · 当前 ${r.views}</p>` : ''}${r.snippet ? `<p class="snippet">${esc(r.snippet)}</p>` : ''}</article>`).join('') : '<div class="empty">暂无符合条件的帖子</div>';
    $('pagination').hidden = view !== 'posts' || !!q;
    $('page').textContent = `${page} / ${pages}`;$('prev').disabled = page <= 1;$('next').disabled = page >= pages;
  } catch (e) {if (current === version) {$('results').innerHTML = `<div class="empty">${esc(errorText(e))}</div>`;$('connection').textContent = '连接未成功 · 可在连接设置中检查';}}
}
async function read(row) {
  const current = ++readerVersion;
  $('detail').textContent = '正在加载正文与评论…';$('reader').showModal();
  try {
    const data = await api('/api/thread?' + new URLSearchParams({site:row.platform,board:row.board_id,thread_id:row.thread_id}));
    if (current !== readerVersion) return;
    let source = '';
    try {const u = new URL(data.thread.source_url);if (u.protocol === 'https:' && ['bbs.uestc.edu.cn','bbs.byr.cn'].includes(u.hostname)) source = `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">查看论坛原帖</a>`;} catch {}
    $('detail').innerHTML = `<h2>${esc(data.thread.title)}</h2><p>${source}</p><p>${data.state?.coverage_status === 'complete' ? '正文与评论已完整采集' : '当前显示已采集部分，后续由电脑继续更新'}</p>` + (data.posts.length ? data.posts.map(p => `<section><p class="meta">${esc(p.floor === 0 ? '主帖' : '第 '+p.floor+' 层')} · ${esc(p.author || '匿名')}</p><div class="body">${esc(p.content_text)}</div></section>`).join('') : '<p>电脑暂未采集正文，请稍后查看。</p>');
  } catch (e) {if(current === readerVersion) $('detail').textContent = errorText(e);}
}
$('settings').onclick = showSettings;
$('close-settings').onclick = () => $('connect').close();
$('connect-form').onsubmit = async e => {
  e.preventDefault();$('connect-error').textContent = '';
  try {
    endpoint = endpointURL($('endpoint').value);key = $('key').value.trim();
    if(key.length < 32) throw Error('请输入电脑生成的完整远程访问密钥');
    await api('/api/overview');
    sessionStorage.setItem('forum-endpoint', endpoint);sessionStorage.setItem('forum-key', key);
    $('key').value = '';$('connect').close();page = 1;await load();await openNotificationTarget();
  } catch(e) {$('connect-error').textContent = errorText(e);}
};
$('logout').onclick = () => {++version;++readerVersion;sessionStorage.removeItem('forum-key');sessionStorage.removeItem('forum-endpoint');endpoint = '';key = '';rows = [];$('key').value = '';$('endpoint').value = '';$('results').replaceChildren();$('detail').replaceChildren();$('pagination').hidden = true;$('connection').textContent = '已清除连接';};
$('search').onsubmit = e => {e.preventDefault();page = 1;setView('posts');};
function setView(value) {view = value;page = 1;$('posts').classList.toggle('active',view === 'posts');$('hot').classList.toggle('active',view === 'hot');$('views').classList.toggle('active',view === 'views');$('site').disabled = view === 'views';$('search').hidden = view !== 'posts';$('category').disabled = view !== 'posts' || !!$('query').value.trim();load();}
$('posts').onclick = () => setView('posts');$('hot').onclick = () => setView('hot');$('views').onclick = () => setView('views');
$('site').onchange = $('category').onchange = () => {page = 1;load();};
$('query').oninput = () => {$('category').disabled = !!$('query').value.trim();};
$('refresh').onclick = load;
$('prev').onclick = () => {if(page > 1){page--;load();}};$('next').onclick = () => {if(page < pages){page++;load();}};
$('results').onclick = e => {const button = e.target.closest('[data-row]');if(button) read(rows[Number(button.dataset.row)]);};
$('close-reader').onclick = () => {++readerVersion;$('reader').close();};
setInterval(() => {if(endpoint && key && !document.hidden && !$('reader').open && !$('connect').open && view !== 'posts') load();},60000);
load();

const notificationTarget = new URLSearchParams(location.search);
let pendingNotification = notificationTarget.has('thread_id');
async function openNotificationTarget() { if(pendingNotification && endpoint && key) { pendingNotification = false; await read({platform:notificationTarget.get('platform'),board_id:notificationTarget.get('board_id'),thread_id:notificationTarget.get('thread_id')}); } }
openNotificationTarget();
