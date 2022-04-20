This tool manages custom html components shared across multiple views.

Each component is described by a widget.info json file this allows you to define
the view, script, and style files.  The view and script get linked to the output
directory while the style gets compiled.

The 'node_modules' directory will be searched for packages that contain a 'widget.json' 
file.  These packages will have their 

Use the middleware (nppMiddleware.js) during development to redeploy all files
when a view is retrieved.  

Setting up a new Widget project
===============================

npm init
npm i express http https
npm i @html-widget/core @html-widget/element
nx widget init

Setting up a new Widget project
===============================

npm init
npm i express http https
npm i @html-widget/core @html-widget/element
npm i babelify
npm i @babel/preset-env
npx widget init
npx widget create -n widget-name
npx widget view -n index

npx widget sass babel pack ejs # use to create non-module babel file
npx widget sass ejs # use for module only

Widget Record
=============

- name: the normalized name of the widget, view, or include
- es6: location of the source module file get's babelified to the 'script' location
- script: location of the babelified .js file
- view: location of the .ejs file, not processed until the pack step
- style: location of the .scss file, processed during render step
- type: {view, widget, include}
  - view: results in a browser target
  - widget: included as an html element in a view or other widget
  - include: .scss or .js include file, does not get processed
- package: package name
- includes: widgets that this view/widget has in it's .ejs file
- parent: views/widget that has this in it's .ejs file

Includes and parent fields are used to determine which files get added during the .ejs render 
and .js browserify processes.  If the file is already included in the .js file, it is not required
to be included here, browserify will handle it.

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
