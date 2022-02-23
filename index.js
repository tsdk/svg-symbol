#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var dom = require('cheerio');
var args = process.argv.slice(2);
var $ = dom.load(
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" style="display:none;"></svg>'
);
var dir;
var fileName;
var svgNode;
var symbolNode;

function clean(ins) {
  var f = ins.attr('fill');
  if (f && f.indexOf('url') > -1) ins.attr('fill', 'currentColor');
  else ins.removeAttr('fill');
  var s = ins.attr('stroke');
  if (s && s.indexOf('url') > -1) ins.attr('stroke', 'currentColor');
  else ins.removeAttr('stroke');
  ins.removeAttr('style');
}

function parse(file) {
  if (path.extname(file) === '.svg') {
    fileName = file.slice(0, -4);
    file = fs.readFileSync(path.join(dir, file), 'utf8');
    svgNode = $(file);
    symbolNode = $('<symbol></symbol>');
    symbolNode.attr('viewBox', svgNode.attr('viewbox'));
    symbolNode.attr('id', fileName);
    symbolNode.append(svgNode.contents());
    symbolNode.children().each(function(i, kid) {
      var ins = $(kid);
      clean(ins);

      ins.children().each(function(i, kid) {
        var ins = $(kid);
        clean(ins);
      });
    });
    $('svg').append(symbolNode);
  }
}

if (args && args.length) {
  dir = args[0];
  fs.readdir(dir, function(err, files) {
    if (err) {
      process.stderr.write(err);
      return;
    }
    files.forEach(parse);
    process.stdout.write($.html());
  });
} else {
  process.stderr.write('Directory not found.');
}
