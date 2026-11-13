(() => {
  'use strict';
  const records = window.RESIDENCE_CASES || [];
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dialog = document.createElement('dialog');
  dialog.id = 'cases-dialog';
  dialog.setAttribute('aria-label', '整装定制 · 私宅设计案例');
  dialog.innerHTML = `<div class="cases-shell"><header class="cases-topbar"><span class="cases-mark">龙湖智造家 <span>/</span> RESIDENCES</span><button type="button" class="cases-return" hidden>← <span>案例汇总</span></button><button type="button" class="cases-close" aria-label="返回演示"><span class="cases-close-label">返回演示</span><i>×</i></button></header><div class="cases-overview"><div class="cases-intro"><div><p class="cases-eyebrow">SELECTED RESIDENCES / CHONGQING</p><h2 id="cases-title">每一种生活，<br>都有自己的答案。</h2><p class="cases-lead">御湖境 × 观萃 · 私宅设计案例<br>从客餐厅的第一眼，走进家的每一个空间。</p></div><div class="cases-edition"><strong>${records.length}</strong>DESIGN STORIES<br>整装定制 / 案例选集</div></div><div class="cases-controls"><div class="cases-filters" aria-label="按楼盘筛选"></div><label class="cases-search"><input type="search" aria-label="搜索小区或房号" placeholder="搜索小区 / 房号"><span aria-hidden="true">⌕</span></label></div><p class="cases-result" aria-live="polite"></p><div class="cases-grid"></div><footer class="cases-end"><span>LONGFOR AURA SPACE / DESIGN COLLECTION</span><span>效果图展示 · 空间与生活方式的提案</span></footer></div><div class="case-detail" hidden></div></div>`;
  document.body.append(dialog);
  const lightbox = document.createElement('dialog');
  lightbox.id = 'case-lightbox';
  lightbox.setAttribute('aria-label', '效果图大图浏览');
  lightbox.innerHTML = `<div class="lightbox-top"><span></span><button type="button" class="lightbox-close" aria-label="关闭大图">×</button></div><img class="lightbox-image" alt=""><button type="button" class="lightbox-prev" aria-label="上一张">‹</button><button type="button" class="lightbox-next" aria-label="下一张">›</button><span class="lightbox-caption"></span><span class="lightbox-counter"></span>`;
  document.body.append(lightbox);
  const shell = dialog.querySelector('.cases-shell');
  const overview = dialog.querySelector('.cases-overview');
  const detail = dialog.querySelector('.case-detail');
  const back = dialog.querySelector('.cases-return');
  const filters = dialog.querySelector('.cases-filters');
  const search = dialog.querySelector('input[type=search]');
  let project = '全部', current = null, photo = 0, overviewScroll = 0, origin = null, cardOrigin = null;
  function visibleRecords() {
    const query = search.value.trim().toLowerCase();
    return records.filter(c => (project === '全部' || c.project === project) && (!query || `${c.unit} ${c.project}`.toLowerCase().includes(query)));
  }
  function renderOverview() {
    filters.innerHTML = ['全部','御湖境','观萃'].map(p => `<button type="button" data-project="${p}" aria-pressed="${p === project}">${p}<sup>${records.filter(c => p === '全部' || c.project === p).length}</sup></button>`).join('');
    const list = visibleRecords();
    dialog.querySelector('.cases-result').textContent = `${project === '全部' ? '全部案例' : project + '案例'} / ${list.length} 个案例 · 点击封面查看空间效果图`;
    dialog.querySelector('.cases-grid').innerHTML = list.map(c => `<button type="button" class="case-card" data-case="${c.id}" aria-label="查看${escape(c.title)}"><div class="case-cover"><img src="${c.cover}" alt="${escape(c.title+' 客餐厅效果图')}" loading="lazy" decoding="async">${c.vr ? '<span class="case-type">VR EXPERIENCE</span>' : ''}<span class="case-arrow" aria-hidden="true">↗</span></div><div class="case-card-meta"><span>${escape(c.project)}</span><span>${String(c.images.length).padStart(2,'0')} ${c.vrPreview ? 'VR 视角' : '效果图'}</span></div><h3>${escape(c.project)} ${escape(c.unit)}</h3></button>`).join('') || '<p class="cases-empty">没有匹配的案例，请更换筛选或搜索内容。</p>';
  }
  let masonryObserver;
  function layoutPhotos() {
    const grid = detail.querySelector('.case-images');
    if (!grid) return;
    for (const figure of grid.children) {
      const button = figure.querySelector('button');
      const caption = figure.querySelector('figcaption');
      const height = button.getBoundingClientRect().height + caption.getBoundingClientRect().height + 11 + 24;
      figure.style.gridRowEnd = 'span ' + Math.ceil(height / 8);
    }
  }
  function observePhotos() {
    masonryObserver?.disconnect();
    masonryObserver = new ResizeObserver(layoutPhotos);
    detail.querySelectorAll('.case-photo button').forEach(el => masonryObserver.observe(el));
    detail.querySelectorAll('.case-photo img').forEach(img => img.addEventListener('load', layoutPhotos, {once:true}));
    layoutPhotos();
  }
  function showCase(id) {
    current = records.find(c => c.id === id);
    if (!current) return;
    overviewScroll = shell.scrollTop;
    cardOrigin = dialog.querySelector(`[data-case="${id}"]`);
    overview.hidden = true; detail.hidden = false; back.hidden = false;
    const c = current;
    const validVr = c.vr && /^https:\/\//.test(c.vr);
    detail.innerHTML = `<div class="case-detail-head"><div><p class="cases-eyebrow">${escape(c.project)} / PRIVATE RESIDENCE</p><h2 tabindex="-1">${escape(c.title)}</h2><p class="case-unit">${escape(c.project)} · ${escape(c.unit)} <span aria-hidden="true">／</span> ${c.images.length} ${c.vrPreview ? '个 VR 空间视角' : '张空间效果图'}</p></div>${validVr ? `<div class="case-detail-actions"><a class="case-vr" href="${escape(c.vr)}" target="_blank" rel="noopener noreferrer">进入全屋 VR <span>↗</span></a></div>` : ''}</div><p class="case-detail-note">${c.vrPreview ? 'VR 空间预览 · 点击图片放大；进入全屋 VR 可旋转视角、切换空间，需联网。' : c.compiled ? '私宅效果图选集 · 点击图片查看完整大图。' : '空间效果图 · 点击图片放大，左右切换浏览。'}</p><div class="case-images">${c.images.map((im,i) => `<figure class="case-photo"><button type="button" data-photo="${i}" aria-label="放大第${i+1}张 ${escape(im.label)}"><img src="${im.src}" alt="${escape(c.title+' '+im.label)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" width="${im.width}" height="${im.height}"><span class="photo-expand">查看大图 ↗</span></button><figcaption><span>${escape(im.label)}</span><span>${String(i+1).padStart(2,'0')} / ${String(c.images.length).padStart(2,'0')}</span></figcaption></figure>`).join('')}</div><div class="case-detail-end"><button type="button" data-back>← 返回案例汇总</button><span class="cases-eyebrow" style="margin:0">DESIGN FOR LIVING</span></div>`;
    observePhotos();
    shell.scrollTop = 0;
    detail.querySelector('h2').focus({preventScroll:true});
  }
  function showOverview() {
    if (lightbox.open) lightbox.close();
    detail.hidden = true; overview.hidden = false; back.hidden = true; current = null;
    shell.scrollTop = overviewScroll;
    cardOrigin?.focus({preventScroll:true});
  }
  function closeCases() { if (lightbox.open) lightbox.close(); dialog.close(); origin?.focus({preventScroll:true}); }
  function showPhoto(i) {
    if (!current) return;
    photo = (i + current.images.length) % current.images.length;
    const im = current.images[photo], img = lightbox.querySelector('img');
    img.src = im.src; img.alt = current.title + ' ' + im.label;
    lightbox.querySelector('.lightbox-top span').textContent = `${current.title}`;
    lightbox.querySelector('.lightbox-caption').textContent = im.label;
    lightbox.querySelector('.lightbox-counter').textContent = `${String(photo+1).padStart(2,'0')} / ${String(current.images.length).padStart(2,'0')}`;
    lightbox.querySelectorAll('.lightbox-prev,.lightbox-next').forEach(b => b.hidden = current.images.length < 2);
    if (!lightbox.open) lightbox.showModal();
  }
  window.openResidenceCases = function() {
    origin = document.activeElement; renderOverview();
    overview.hidden = false; detail.hidden = true; back.hidden = true; current = null;
    if (!dialog.open) dialog.showModal();
    shell.scrollTop = 0;
  };
  filters.addEventListener('click', e => { const b=e.target.closest('[data-project]'); if(b){project=b.dataset.project;renderOverview();} });
  search.addEventListener('input',renderOverview);
  dialog.querySelector('.cases-grid').addEventListener('click',e => {const b=e.target.closest('[data-case]');if(b)showCase(b.dataset.case);});
  detail.addEventListener('click',e => {const b=e.target.closest('[data-photo]');if(b)showPhoto(+b.dataset.photo);if(e.target.closest('[data-back]'))showOverview();});
  back.addEventListener('click',showOverview);
  dialog.querySelector('.cases-close').addEventListener('click',closeCases);
  dialog.addEventListener('cancel',e => {e.preventDefault();current?showOverview():closeCases();});
  lightbox.addEventListener('cancel',e=>{e.preventDefault();lightbox.close();});
  lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click',()=>showPhoto(photo-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click',()=>showPhoto(photo+1));
  lightbox.addEventListener('keydown',e => {if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photo-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photo+1);}});
  let startX=0,startY=0;
  lightbox.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});
  lightbox.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.3)showPhoto(photo+(dx<0?1:-1));},{passive:true});
  for(const modal of [dialog,lightbox]) for(const event of ['wheel','keydown','touchstart','touchend','pointerdown','click']) modal.addEventListener(event,e=>e.stopPropagation(),{passive:event==='wheel'||event.startsWith('touch')});
  const entry=[...document.querySelectorAll('[data-slide-id="brand"] .brand-trio>div')].find(x=>x.querySelector('h3')?.textContent.trim()==='整装定制');
  if(entry){entry.classList.add('case-entry');entry.setAttribute('role','button');entry.setAttribute('tabindex','0');entry.setAttribute('aria-haspopup','dialog');entry.setAttribute('aria-controls',dialog.id);entry.setAttribute('aria-label','整装定制，查看御湖境与观萃案例');entry.insertAdjacentHTML('beforeend','<span class="case-entry-link">查看私宅案例 <b>↗</b></span>');entry.addEventListener('click',window.openResidenceCases);entry.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();window.openResidenceCases();}});}
})();
