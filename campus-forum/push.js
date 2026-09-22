'use strict';
let pushRegistration;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(r => { pushRegistration = r; }).catch(() => {});
}
async function pushApi(path, body) {
  if (!endpoint || !key) throw Error('请先在连接设置中连接电脑');
  const r = await fetch(endpoint + path, {method:'POST',credentials:'omit',redirect:'error',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const data = await r.json();if(!r.ok) throw Error(data.error || '操作失败');
}
function pushMessage(message) { $('push-status').textContent = message; }
$('enable-push').onclick = async () => {
  try {
    if (!endpoint || !key) throw Error('请先连接电脑');
    if (!('PushManager' in window) || !('Notification' in window)) throw Error('请使用 iOS 16.4+，将网页添加到主屏幕后从图标打开');
    // Permission request must directly follow the user's tap on iOS.
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw Error('通知尚未获准，请在 iPhone 通知设置中允许');
    const registration = await navigator.serviceWorker.ready;
    const config = await api('/api/push/key');
    const value = config.public_key.replace(/-/g,'+').replace(/_/g,'/');
    const bytes = Uint8Array.from(atob(value+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
    let subscription = await registration.pushManager.getSubscription();
    if(subscription && subscription.options.applicationServerKey &&
       btoa(String.fromCharCode(...new Uint8Array(subscription.options.applicationServerKey))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') !== config.public_key) {
      await subscription.unsubscribe();subscription = null;
    }
    subscription = subscription || await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
    await pushApi('/api/push/subscribe',subscription.toJSON());
    pushMessage('提醒已开启：增速 >100/分钟；同帖 10 分钟内最多提醒一次。');
  } catch(e) {pushMessage(errorText(e));}
};
$('test-push').onclick = async () => {
  try {
    const registration = await navigator.serviceWorker.ready, sub = await registration.pushManager.getSubscription();
    if(!sub) throw Error('请先开启提醒');
    await pushApi('/api/push/test',{endpoint:sub.endpoint});
    pushMessage('测试通知已排队，电脑采集网页运行时会发送，请检查锁屏通知。');
  } catch(e) {pushMessage(errorText(e));}
};
$('disable-push').onclick = async () => {
  try {
    const registration = await navigator.serviceWorker.ready, sub = await registration.pushManager.getSubscription();
    if(sub) {
      await sub.unsubscribe();
      try {await pushApi('/api/push/unsubscribe',{endpoint:sub.endpoint});} catch {}
    }
    pushMessage('此设备已关闭提醒');
  } catch(e) {pushMessage(errorText(e));}
};
