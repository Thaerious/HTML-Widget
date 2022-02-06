The objective is to inject 'view' files with nidget templates.
SASS files need to be compiled at the same time.
ES6 files need to be copied/linked/babel'd.

Module (.mjs) files may contain a class is a subclass of NidgetElement.
These classes denote nidgets.  Nidgets must have a unique name, since html
elements in a view will invoke injection based on the nidget name.  When a 
nidget is injected the template is added to the head element, and 
the module is imported to the head element.

Any files that share a name with a nidget or a view component are considered
associated with that component.

Discover must happen before translating sass, since the records are used to 
determine which .sass files require translating.

All .mjs files get copied/linked to the output directory.
Also, all .sass files get compiled to .css files.  Only root .sass
files need be compiled.

The output directory keeps the same structure as the input directory, this
way all references maintain the correct path. All files get copied to 
output_directory/package_path

All external packages get recorded in import_map.ejs which in turn
get's injected into each view file.  The map for each package is
package_path -> package.json#module | package.json#name.

External packages have a nidget.json file which will specify the 
files for a nidget relative to the package root directory.  Local
nidgets are discovered from the output directory.

Setting up a new Nidget project
===============================

npm init
npm i @nidget/core
npm i babelify
npm i @babel/preset-env
npx nidget init
npx nidget create -n nidget-name
npx nidget view -n index

npx nidget sass babel pack ejs # use to create non-module babel file
npx nidget sass ejs # use for module only

Nidget Record
=============

- name: the normalized name of the nidget, view, or include
- es6: location of the source module file get's babelified to the 'script' location
- script: location of the babelified .js file
- view: location of the .ejs file, not processed until the pack step
- style: location of the .scss file, processed during render step
- type: {view, nidget, include}
  - view: results in a browser target
  - nidget: included as an html element in a view or other nidget
  - include: .scss or .js include file, does not get processed
- package: package name
- includes: nidgets that this view/nidget has in it's .ejs file
- parent: views/nidget that has this in it's .ejs file

Includes and parent fields are used to determine which files get added during the .ejs render 
and .js browserify processes.  If the file is already included in the .js file, it is not required
to be included here, browserify will handle it.

LIB
===
Search node_modules for nidget libraries.
Using the package-dir field in nidget.json
copy any files found there to the output/lib_name 
directory. Loads the records from nidget.json and 
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
  
