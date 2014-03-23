var cli = require('cli').enable('status'),
fs = require('fs'),
LiveJournal = require('livejournal'),
Entities = require('html-entities').AllHtmlEntities,
entities = new Entities();

cli.parse({
  username: ['u', 'Username', 'string'],
  path: ['p', 'Jekyll blog location', 'path']
});


cli.main(function(args, options) {
  if (!options.username) {
    cli.fatal('You must specify username.');
  }
  if (!options.username) {
    cli.fatal('You must specify path.');
  }
  downloadPosts(options.username,options.path);
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
    savePosts(value.events,path);
  });
}

function savePosts(events,path) {
  for (i in events) {
    if (events[i].subject) {
      var title = entities.encode(events[i].subject);
    }
    var post = '---\n' +
      'layout: post\n' +
      'title: "' + title + '"\n' +
      'date: ' + events[i].eventtime + '\n' +
      '---\n' + events[i].event;
    console.log(events[i].ditemid);
    fs.writeFile(path + '/_posts/' + events[i].eventtime.substring(0,10) + '-' + events[i].ditemid + '.html', post, function (err) {
      if (err) throw err;
    });
  }
}
