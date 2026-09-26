// VFS v1: IndexedDB-backed virtual file system for Studio.
// Stores projects + files. Exposes window.vfs.
(function(){
  if(window.__vbVfs) return;
  window.__vbVfs = true;

  var DB = 'vb_studio', VER = 1, db = null;

  function openDB(){
    return new Promise(function(res, rej){
      if(db) return res(db);
      var r = indexedDB.open(DB, VER);
      r.onupgradeneeded = function(e){
        var d = e.target.result;
        if(!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', {keyPath:'id'});
        if(!d.objectStoreNames.contains('files')) d.createObjectStore('files', {keyPath:['projectId','path']});
      };
      r.onsuccess = function(e){ db = e.target.result; res(db); };
      r.onerror = function(e){ rej(e.target.error); };
    });
  }

  function store(name, mode){
    return openDB().then(function(d){ return d.transaction(name, mode).objectStore(name); });
  }

  function req(r){
    return new Promise(function(res, rej){
      r.onsuccess = function(e){ res(e.target.result); };
      r.onerror = function(e){ rej(e.target.error); };
    });
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  window.vfs = {
    open: openDB,
    createProject: function(name, source){
      return store('projects','readwrite').then(function(s){
        var p = {id: uid(), name: name, source: source||'local', createdAt: Date.now()};
        return req(s.add(p)).then(function(){ return p; });
      });
    },
    listProjects: function(){ return store('projects','readonly').then(function(s){ return req(s.getAll()); }); },
    deleteProject: function(id){
      return store('files','readwrite').then(function(s){
        return new Promise(function(res){
          var cur = s.openCursor();
          cur.onsuccess = function(e){
            var c = e.target.result;
            if(c){ if(c.value.projectId===id) c.delete(); c.continue(); } else res();
          };
        });
      }).then(function(){
        return store('projects','readwrite').then(function(s){ return req(s.delete(id)); });
      });
    },
    writeFile: function(pid, path, content){
      return store('files','readwrite').then(function(s){
        return req(s.put({projectId:pid, path:path, type:'file', content:content||'', modifiedAt:Date.now()}));
      });
    },
    readFile: function(pid, path){
      return store('files','readonly').then(function(s){ return req(s.get([pid,path])); });
    },
    deleteFile: function(pid, path){
      return store('files','readwrite').then(function(s){ return req(s.delete([pid,path])); });
    },
    listFiles: function(pid){
      return store('files','readonly').then(function(s){
        return new Promise(function(res){
          var out=[];
          var cur = s.openCursor();
          cur.onsuccess = function(e){
            var c = e.target.result;
            if(c){ if(c.value.projectId===pid) out.push(c.value); c.continue(); } else res(out);
          };
        });
      });
    },
    createFolder: function(pid, path){
      return store('files','readwrite').then(function(s){
        return req(s.put({projectId:pid, path:path, type:'folder', modifiedAt:Date.now()}));
      });
    },
    ensureParents: function(pid, path){
      var parts = path.split('/');
      var promises = [];
      for(var i=1; i<parts.length; i++){
        (function(p){
          promises.push(window.vfs.readFile(pid,p).then(function(f){
            if(!f) return window.vfs.createFolder(pid,p).catch(function(){});
          }));
        })(parts.slice(0,i).join('/'));
      }
      return Promise.all(promises);
    },
    seed: function(pid){
      return window.vfs.listFiles(pid).then(function(files){
        if(files.length) return;
        return Promise.all([
          window.vfs.writeFile(pid, 'index.html',
            '<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello from VibeBridge Studio</h1>\n  <p>Edit me in the left panel.</p>\n  <script src="app.js"><\/script>\n</body>\n</html>'),
          window.vfs.writeFile(pid, 'style.css',
            'body { font-family: system-ui, sans-serif; margin: 2rem; background: #f1ead2; color: #33291a; }\nh1 { color: #a8801f; }'),
          window.vfs.writeFile(pid, 'app.js',
            'console.log("hello from studio");')
        ]);
      });
    }
  };
})();
