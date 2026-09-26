// Studio Editor v1: real file tree + tabbed code editor, wired to vfs.js.
// Patches the studioshell layout: replaces static tree, adds editor tabs above #main.
(function(){
  if(window.__vbStudioEdit) return;
  window.__vbStudioEdit = true;

  function E(t,c,h){ var d=document.createElement(t); if(c) d.className=c; if(h!=null) d.innerHTML=h; return d; }
  function say(m){ if(window.toast) toast(m); else console.log(m); }

  var LS_KEY = 'vb_studio_edit_state';
  var state = { projectId: null, openTabs: [], activeTab: '__chat__', collapsed: {} };

  function saveState(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
  }
  function loadState(){
    try{
      var s = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if(s){
        state.projectId = s.projectId || null;
        state.openTabs = s.openTabs || [];
        state.activeTab = s.activeTab || '__chat__';
        state.collapsed = s.collapsed || {};
      }
    }catch(e){}
  }

  var style = document.createElement('style');
  style.id = 'vb-studioedit-css';
  style.textContent =
    '.sk-left { display: flex; flex-direction: column; min-height: 0; }' +
    '.sk-tree { flex: 1; overflow-y: auto; min-height: 100px; }' +
    '.sk-tree-toolbar { display: flex; gap: 4px; padding: 0 4px 8px; }' +
    '.sk-tree-toolbar button { flex: 1; padding: 5px; font-size: 11px; border: 1px solid var(--sk-line); border-radius: 5px; background: var(--sk-card); color: var(--sk-dim); cursor: pointer; font-weight: 600; }' +
    '.sk-tree-toolbar button:hover { background: var(--sk-acc); color: #fff; border-color: var(--sk-acc); }' +
    '.sk-tree-item { display: flex; gap: 6px; align-items: center; padding: 5px 8px; border-radius: 5px; font-size: 12px; color: var(--sk-dim); cursor: pointer; user-select: none; }' +
    '.sk-tree-item:hover { background: rgba(168,128,31,.12); }' +
    '.sk-tree-item.active { background: rgba(168,128,31,.2); color: var(--sk-ink); font-weight: 600; }' +
    '.sk-tree-item .caret { width: 10px; font-size: 9px; color: var(--sk-dim); flex: none; text-align: center; }' +
    '.sk-tree-item .ico { width: 10px; height: 12px; flex: none; border-radius: 2px; }' +
    '.sk-tree-item .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }' +
    '.sk-tree-item .del { opacity: 0; font-size: 10px; color: var(--sk-dim); padding: 0 4px; flex: none; cursor: pointer; }' +
    '.sk-tree-item:hover .del { opacity: 1; }' +
    '.sk-tree-item .del:hover { color: #c23616; }' +
    '.sk-tree-empty { padding: 20px 10px; text-align: center; color: var(--sk-dim); font-size: 11px; }' +
    '.sk-editor-tabs { display: flex; background: var(--sk-side); border-bottom: 1px solid var(--sk-line); overflow-x: auto; min-height: 36px; flex: none; }' +
    '.sk-editor-tab { padding: 8px 14px; font-size: 12px; color: var(--sk-dim); border-right: 1px solid var(--sk-line); cursor: pointer; display: flex; gap: 8px; align-items: center; white-space: nowrap; flex: none; }' +
    '.sk-editor-tab:hover { background: var(--sk-card); }' +
    '.sk-editor-tab.active { background: var(--sk-card); color: var(--sk-acc); font-weight: 600; }' +
    '.sk-editor-tab .x { opacity: .5; font-size: 10px; padding: 0 2px; }' +
    '.sk-editor-tab .x:hover { opacity: 1; color: #c23616; }' +
    '.sk-editor-pane { flex: 1; min-height: 0; position: relative; display: none; }' +
    '.sk-code { width: 100%; height: 100%; background: var(--sk-card); color: var(--sk-ink); border: none; padding: 16px; font: 13px/1.6 ui-monospace, Menlo, Consolas, monospace; resize: none; outline: none; }' +
    '#sk-center-body { display: flex; flex-direction: column; min-height: 0; flex: 1; }' +
    '#sk-center-body[data-view="chat"] .sk-editor-pane { display: none !important; }' +
    '#sk-center-body[data-view="chat"] #main { display: flex !important; flex: 1; min-height: 0; }' +
    '#sk-center-body[data-view="editor"] .sk-editor-pane { display: flex !important; flex: 1; min-height: 0; }' +
    '#sk-center-body[data-view="editor"] #main { display: none !important; }';
  document.head.appendChild(style);

  function buildTree(files){
    var children = {};
    files.forEach(function(f){
      var parts = f.path.split('/');
      var parent = parts.length > 1 ? parts.slice(0,-1).join('/') : '';
      if(!children[parent]) children[parent] = [];
      children[parent].push(f);
    });
    Object.keys(children).forEach(function(k){
      children[k].sort(function(a,b){
        if(a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.path.localeCompare(b.path);
      });
    });
    return children;
  }

  function colorFor(path){
    var ext = (path.split('.').pop() || '').toLowerCase();
    if(ext === 'html' || ext === 'htm') return '#a8801f';
    if(ext === 'js' || ext === 'mjs') return '#6f7d33';
    if(ext === 'css') return '#4a6fa5';
    if(ext === 'json') return '#c9a227';
    if(ext === 'md') return '#555';
    return '#888';
  }

  function renderTree(){
    var treeEl = document.querySelector('.sk-tree');
    if(!treeEl || !state.projectId) return;
    treeEl.innerHTML = '';

    window.vfs.listFiles(state.projectId).then(function(files){
      if(!files.length){
        treeEl.appendChild(E('div','sk-tree-empty','Empty project. Use "+ File" to start.'));
        return;
      }
      var children = buildTree(files);

      function renderLevel(parentPath, depth){
        var items = children[parentPath] || [];
        items.forEach(function(f){
          var isFolder = f.type === 'folder';
          var name = f.path.split('/').pop();
          var item = E('div','sk-tree-item');
          item.style.paddingLeft = (8 + depth * 12) + 'px';
          if(f.path === state.activeTab) item.classList.add('active');
          item.dataset.path = f.path;

          var caret = E('span','caret');
          if(isFolder) caret.textContent = state.collapsed[f.path] ? '▸' : '▾';
          item.appendChild(caret);

          var ico = E('span','ico');
          ico.style.background = isFolder ? '#a8801f' : colorFor(f.path);
          item.appendChild(ico);
          item.appendChild(E('span','name', name));

          var del = E('span','del','✕');
          del.title = 'Delete';
          del.onclick = function(e){
            e.stopPropagation();
            if(!confirm('Delete ' + f.path + '?')) return;
            var toDelete = [f.path];
            if(isFolder){
              files.forEach(function(o){
                if(o.path.indexOf(f.path + '/') === 0) toDelete.push(o.path);
              });
            }
            Promise.all(toDelete.map(function(p){ return window.vfs.deleteFile(state.projectId, p); }))
              .then(function(){
                state.openTabs = state.openTabs.filter(function(p){ return toDelete.indexOf(p) === -1; });
                if(toDelete.indexOf(state.activeTab) !== -1) state.activeTab = '__chat__';
                saveState(); renderAll();
              });
          };
          item.appendChild(del);

          item.onclick = function(){
            if(isFolder){
              state.collapsed[f.path] = !state.collapsed[f.path];
              saveState(); renderTree();
            } else {
              openFile(f.path);
            }
          };
          treeEl.appendChild(item);
          if(isFolder && !state.collapsed[f.path]) renderLevel(f.path, depth + 1);
        });
      }
      renderLevel('', 0);
    });
  }

  function openFile(path){
    if(state.openTabs.indexOf(path) === -1) state.openTabs.push(path);
    state.activeTab = path;
    saveState(); renderTabs(); renderEditor(); renderTree();
  }
  function closeTab(path){
    state.openTabs = state.openTabs.filter(function(p){ return p !== path; });
    if(state.activeTab === path){
      state.activeTab = state.openTabs.length ? state.openTabs[state.openTabs.length-1] : '__chat__';
    }
    saveState(); renderTabs(); renderEditor(); renderTree();
  }
  function switchTab(path){
    state.activeTab = path;
    saveState(); renderTabs(); renderEditor(); renderTree();
  }

  function renderTabs(){
    var tabsEl = document.querySelector('.sk-editor-tabs');
    if(!tabsEl) return;
    tabsEl.innerHTML = '';

    var chatTab = E('div','sk-editor-tab' + (state.activeTab === '__chat__' ? ' active' : ''));
    chatTab.appendChild(E('span','','💬 Chat'));
    chatTab.onclick = function(){ switchTab('__chat__'); };
    tabsEl.appendChild(chatTab);

    state.openTabs.forEach(function(path){
      var name = path.split('/').pop();
      var tab = E('div','sk-editor-tab' + (state.activeTab === path ? ' active' : ''));
      tab.appendChild(E('span','', name));
      var x = E('span','x','✕');
      x.onclick = function(e){ e.stopPropagation(); closeTab(path); };
      tab.appendChild(x);
      tab.onclick = function(){ switchTab(path); };
      tabsEl.appendChild(tab);
    });

    var body = document.getElementById('sk-center-body');
    if(body) body.setAttribute('data-view', state.activeTab === '__chat__' ? 'chat' : 'editor');
  }

  function renderEditor(){
    var pane = document.querySelector('.sk-editor-pane');
    if(!pane) return;
    pane.innerHTML = '';
    if(state.activeTab === '__chat__') return;

    window.vfs.readFile(state.projectId, state.activeTab).then(function(f){
      var ta = document.createElement('textarea');
      ta.className = 'sk-code';
      ta.value = f ? (f.content || '') : '';
      ta.spellcheck = false;
      var saveTimer = null;
      ta.oninput = function(){
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function(){
          window.vfs.writeFile(state.projectId, state.activeTab, ta.value);
        }, 400);
      };
      pane.appendChild(ta);
    });
  }

  function renderAll(){ renderTree(); renderTabs(); renderEditor(); }

  function patchLayout(){
    var body = document.getElementById('sk-center-body');
    if(!body || body.dataset.editorPatched) return false;
    var mainEl = document.getElementById('main');
    if(!mainEl || mainEl.parentNode !== body) return false;

    body.dataset.editorPatched = '1';
    body.removeChild(mainEl);

    var editorTabs = E('div','sk-editor-tabs');
    var editorPane = E('div','sk-editor-pane');

    body.appendChild(editorTabs);
    body.appendChild(mainEl);
    body.appendChild(editorPane);
    return true;
  }

  function patchSidebar(){
    var left = document.querySelector('.sk-left');
    if(!left || left.dataset.editorPatched) return false;
    var staticFolder = left.querySelector('.sk-folder');
    if(!staticFolder) return false;

    left.dataset.editorPatched = '1';
    var items = left.querySelectorAll('.sk-folder, .sk-file');
    Array.prototype.forEach.call(items, function(el){ el.remove(); });

    var toolbar = E('div','sk-tree-toolbar');
    var newFileBtn = E('button','','+ File');
    newFileBtn.onclick = function(){
      var path = prompt('File path (e.g. src/main.js):');
      if(!path) return;
      path = path.trim().replace(/^\/+/, '');
      if(!path) return;
      window.vfs.ensureParents(state.projectId, path)
        .then(function(){ return window.vfs.writeFile(state.projectId, path, ''); })
        .then(function(){ openFile(path); });
    };
    var newFolderBtn = E('button','','+ Folder');
    newFolderBtn.onclick = function(){
      var path = prompt('Folder path (e.g. src/components):');
      if(!path) return;
      path = path.trim().replace(/^\/+|\/+$/g, '');
      if(!path) return;
      window.vfs.createFolder(state.projectId, path).then(function(){
        delete state.collapsed[path];
        saveState(); renderAll();
      });
    };
    toolbar.appendChild(newFileBtn);
    toolbar.appendChild(newFolderBtn);

    var treeEl = E('div','sk-tree');
    var searchEl = left.querySelector('.sk-search');
    if(searchEl && searchEl.nextSibling){
      left.insertBefore(toolbar, searchEl.nextSibling);
      left.insertBefore(treeEl, toolbar.nextSibling);
    } else {
      left.appendChild(toolbar);
      left.appendChild(treeEl);
    }
    return true;
  }

  async function init(){
    loadState();
    try{ await window.vfs.open(); }catch(e){ console.error('vfs open failed', e); return; }

    var projects = await window.vfs.listProjects();
    var defaultProject = projects.find(function(p){ return p.name === 'Local project'; });
    if(!defaultProject){
      defaultProject = await window.vfs.createProject('Local project', 'local');
      await window.vfs.seed(defaultProject.id);
    }
    if(!state.projectId || !projects.find(function(p){ return p.id === state.projectId; })){
      state.projectId = defaultProject.id;
      saveState();
    }

    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      var a = patchLayout();
      var b = patchSidebar();
      if(a && b){ renderAll(); clearInterval(iv); }
      if(tries > 100) clearInterval(iv);
    }, 200);
  }

  init();
  window.vbStudioEdit = { openFile: openFile, renderAll: renderAll, getState: function(){ return state; } };
})();
