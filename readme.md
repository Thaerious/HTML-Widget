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

Build
=====

npx widget build

When the build chain is invoked the www/compiled and www/linked directories a created and populated with the web app.  The build chain consists of the following steps:

 - tree
 - discover
 - link
 - style
 - import packages
 - include

Tree
====

npx widget tree

Creates the directory tree and empty files in the www/ directory.

Discover
========

npx widget discover

Examines the client-src directory for components and views in order to create a list of records.  Each record is build from the widnget.info file inside a sub-directory.  This information is used to build the ouptput files.  See below for an example of a widget record.

Link
====

npx widget link

Creates the www/linked directory.  Then, for each view, creates a virtal link from www/linked to the client-src sub-directory.  This permits the browsing of the .ejs files.


Style
=====

npx widget style

Uses sass to compile the style files and put them in the appropriate www/compiled sub-directory.

Include
=======

npx widget include

Populates the templates.ejs file for each view.  This file copies all the required .ejs files from each component element.  The required files are determined automatically by traversing the DOM and looking for components.

Widget View Record
==================

{
  "type": "view",
  "fullName": "index",
  "view": "index.ejs",
  "es6": "Index.mjs",
  "style": {
    "src": "index.scss",
    "dest": "index.css"
  },
  "dir": {
    "sub": "test_widget/index",
    "src": "client-src/test_widget/index",
    "dest": "www/compiled/test_widget/index"
  },
  "package": "test_widget"
}

LIB
===

Search node_modules for widget libraries.
Using the package-dir field in widget.json
copy any files found there to the output/lib_name 
directory. Loads the records from widget.json and 
updates the records to match the destination
files.

Creates an import_map.ejs file that contains a mapping from
the package name to the location of module field in the
package.json file.

Copy MJS
========

Copy or link all es6 files found in the records.
Updates the records to match the destination file.
Only operates on records from this package.
  
Notes
=====

widget source and view source will default to "./src"

Initializing a package
======================

mkdir package_name
cd package_name
npm init
npm i @html-widget/core
npx widget init
