var cli = require('cli').enable('status'),
fs = require('fs'),
LiveJournal = require('livejournal'),
Entities = require('html-entities').AllHtmlEntities,
entities = new Entities();

cli.parse({
  name: ['n', 'Username', 'string'],
  path: ['p', 'Jekyll blog location', 'path'],
  update: ['u', 'Download latest N blog posts (max 50)', 'number']
});


cli.main(function(args, options) {
  if (!options.name) {
    cli.fatal('You must specify username.');
  }
  if (!options.path) {
    cli.fatal('You must specify path.');
  }
  if(options.update) {
    updatePosts(options.name,options.path,options.update);
  }
  else {
    downloadPosts(options.name,options.path);
  }
});

function downloadPosts(username,path,beforedate) {
  var params = {
    journal: username,
    auth_method: 'noauth',
    selecttype: 'lastn',
    howmany: 50
  };
  if (beforedate) {
    params.beforedate = beforedate;
  }
  LiveJournal.RPC.getevents(params, function(err, value) {
    if (value.events[49]) {
      downloadPosts(username,path,value.events[49].eventtime)
    }
    for (i in value.events) {
      savePost(value.events[i],path);
    }
  });
}

function savePost(event,path) {
  if (event.subject) {
    var title = entities.encode(event.subject);
  }
  var post = '---\n' +
    'layout: post\n' +
    'title: "' + title + '"\n' +
    'date: ' + event.eventtime + '\n' +
    '---\n' + event.event;
  console.log(event.ditemid);
  fs.writeFile(path + '/_posts/' + event.eventtime.substring(0,10) + '-' + event.ditemid + '.html', post, function (err) {
    if (err) throw err;
  });
}

function updatePosts(username,path,howmany) {
  var params = {
    journal: username,
    auth_method: 'noauth',
    selecttype: 'lastn',
    howmany: howmany
  };
  LiveJournal.RPC.getevents(params, function(err, value) {
    for (i in value.events) {
      var postpath = path + '/_posts/' + value.events[i].eventtime.substring(0,10) + '-' + value.events[i].ditemid + '.html';
      if (!fs.existsSync(postpath)) {
        savePost(value.events[i],path);
      }
    }
  });
}
