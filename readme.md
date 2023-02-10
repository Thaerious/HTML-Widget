This tool manages custom html components shared across multiple views.

Each component is described by a widget.info json file this allows you to define
the view, script, and style files.  The view and script get linked to the output
directory while the style gets compiled.

The 'node_modules' directory will be searched for packages that contain a 'widget.json' 
file.  

Use the middleware (nppMiddleware.js) during development to redeploy all files
when a view is retrieved.  

Setting up a new Widget project
===============================

npm init
npm i express http https
npm i git@github.com:Thaerious/HTML-Widget.git
npx widget init

Getting Started
===============

Create a new view called index:
npx widget create view index

Start up the default server:
npx server

Browse to http://127.0.0.1:8000/index

Adding A Component
==================

npx widget create component

A component is a standalone partial ejs file.  They must consiste of a two part name delimited by a dash (-).  When used in a view, the build toolchain will create a template.ejs file in the compiled directory.  This file is included in the view.ejs files found in client-src.

Explanation
===========

Widget init created the client-src/ and www/ directories.  The client-src/ directory is where the source code goes.  The www/ directory is where transpiled code will end up.  There is also a www/static directory where static html files can go.  The default server will serve the directories in the following order: www/static, www/compiled, www/linked.

By default the widget middleware will build the code everytime an index page is browsed.

Records
========

    npx widget records

Examines the www directory for components and views in order to create
and display a list of records.  

Style
=====

    npx widget style

Uses sass to compile the style files and put them in the appropriate www/compiled sub-directory.

# Development

## C8

Make c8 globally executable.
    npm i c8 -g
    sudo ln -s /opt/node/19.3.0/lib/node_modules/c8/bin/c8.js /usr/local/bin/c8

use the --cwd flag to test
    c8 --all node src/cli.js --cwd ../TEST_PROJECT COMMAND


